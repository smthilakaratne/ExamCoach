// backend/routes/contentRoute.js
const express = require("express")
const router = express.Router()
const { StatusCodes } = require("http-status-codes")
const mongoose = require("mongoose")
const streamifier = require("streamifier")

const createResponse = require("../lib/createResponse")
const Content = require("../models/Content")
const Subject = require("../models/Subject")

const { upload, getGridFsBucket } = require("../config/gridfs")
const cloudinary = require("../config/cloudinary")

// ─── Constants ────────────────────────────────────────────────────────────────
const CLOUDINARY_SIZE_THRESHOLD = 10 * 1024 * 1024 // 10 MB in bytes

// ─── Helper ───────────────────────────────────────────────────────────────────
function isInvalidId(res, id) {
    if (!mongoose.isValidObjectId(id)) {
        createResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID format")
        return true
    }
    return false
}

// ─── Upload Helpers ───────────────────────────────────────────────────────────

// Upload a memory-buffer file into GridFSBucket
function uploadBufferToGridFS(file) {
    return new Promise((resolve, reject) => {
        const bucket = getGridFsBucket()

        const uploadStream = bucket.openUploadStream(`${Date.now()}-${file.originalname}`, {
            contentType: file.mimetype,
            metadata: { originalName: file.originalname },
        })

        uploadStream.on("error", reject)

        uploadStream.on("finish", () => {
            resolve({
                storage: "gridfs",
                _id: uploadStream.id,
                filename: uploadStream.filename,
                contentType: file.mimetype,
                length: file.size,
            })
        })

        uploadStream.end(file.buffer)
    })
}

// Upload a memory-buffer file to Cloudinary
function uploadBufferToCloudinary(file, folder = "content") {
    return new Promise((resolve, reject) => {
        const resourceType = file.mimetype.startsWith("video/") ? "video" : "raw" // 'raw' for PDFs/docs

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`,
                use_filename: true,
                unique_filename: true,
            },
            (error, result) => {
                if (error) return reject(error)
                resolve({
                    storage: "cloudinary",
                    publicId: result.public_id,
                    fileUrl: result.secure_url,
                    contentType: file.mimetype,
                    length: result.bytes,
                    filename: result.original_filename,
                })
            },
        )

        streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
}

/**
 * Smart upload: routes to GridFS or Cloudinary based on file size.
 * Files >= 10 MB go to Cloudinary; smaller files go to GridFS.
 *
 * @param {object} file - Multer memory file object
 * @param {string} folder - Cloudinary folder name (used only if routed to Cloudinary)
 * @returns {object} result with a `storage` field ("gridfs" | "cloudinary") plus metadata
 */
async function smartUpload(file, folder = "content") {
    if (file.size >= CLOUDINARY_SIZE_THRESHOLD) {
        console.log(`📤 File size ${(file.size / 1024 / 1024).toFixed(2)} MB ≥ 10 MB → Cloudinary`)
        return uploadBufferToCloudinary(file, folder)
    }
    console.log(`📦 File size ${(file.size / 1024 / 1024).toFixed(2)} MB < 10 MB → GridFS`)
    return uploadBufferToGridFS(file)
}

/**
 * Maps a smartUpload result to Content model fields.
 * Works for both main file and answer sheet.
 *
 * @param {object} uploaded - Result from smartUpload()
 * @param {"main"|"answerSheet"} type
 * @returns {object} partial Content fields to spread into contentData
 */
function mapUploadResultToFields(uploaded, type = "main") {
    const isMain = type === "main"

    if (uploaded.storage === "cloudinary") {
        return isMain
            ? {
                  fileUrl: uploaded.fileUrl,
                  cloudinaryPublicId: uploaded.publicId,
                  fileName: uploaded.filename,
                  fileType: uploaded.contentType,
                  fileSize: uploaded.length,
                  fileStorage: "cloudinary",
              }
            : {
                  hasAnswerSheet: true,
                  answerSheetFileUrl: uploaded.fileUrl,
                  answerSheetCloudinaryPublicId: uploaded.publicId,
                  answerSheetFileName: uploaded.filename,
                  fileStorage: "cloudinary", // reuse same storage flag on schema level
              }
    }

    // GridFS
    return isMain
        ? {
              fileId: uploaded._id,
              fileName: uploaded.filename,
              fileType: uploaded.contentType,
              fileSize: uploaded.length,
              fileStorage: "gridfs",
          }
        : {
              hasAnswerSheet: true,
              answerSheetFileId: uploaded._id,
              answerSheetFileName: uploaded.filename,
          }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// CREATE - Add new content WITH file upload
router.post(
    "/",
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "answerSheet", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const {
                title,
                subject,
                contentType,
                description,
                year,
                term,
                unit,
                tags,
                videoUrl,
                thumbnailUrl,
            } = req.body

            // Validation
            if (!title || !subject || !contentType) {
                return createResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Title, subject, and content type are required",
                )
            }

            // Validate subject ID format
            if (!mongoose.isValidObjectId(subject)) {
                return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid subject ID format")
            }

            // Check if subject exists
            const subjectExists = await Subject.findById(subject)
            if (!subjectExists) {
                return createResponse(res, StatusCodes.NOT_FOUND, "Subject not found")
            }

            // Validate content type
            const validTypes = ["past_paper", "lesson", "short_notes", "lecture_video"]
            if (!validTypes.includes(contentType)) {
                return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid content type")
            }

            // If not video, require a file
            if (contentType !== "lecture_video" && !req.files?.file?.[0]) {
                return createResponse(res, StatusCodes.BAD_REQUEST, "PDF file is required")
            }

            // Prepare content data
            const contentData = {
                title,
                subject,
                contentType,
                description,
                year: year ? parseInt(year) : undefined,
                term: term || "",
                unit,
                tags: tags
                    ? Array.isArray(tags)
                        ? tags
                        : tags.split(",").map((t) => t.trim())
                    : [],
                videoUrl,
                thumbnailUrl,
            }

            // Handle main file upload (smart routing)
            if (req.files?.file?.[0]) {
                const uploaded = await smartUpload(req.files.file[0], "content/files")
                Object.assign(contentData, mapUploadResultToFields(uploaded, "main"))
            }

            // Handle answer sheet upload (smart routing, optional)
            if (req.files?.answerSheet?.[0]) {
                const uploadedAns = await smartUpload(
                    req.files.answerSheet[0],
                    "content/answer-sheets",
                )
                Object.assign(contentData, mapUploadResultToFields(uploadedAns, "answerSheet"))
            }

            // Create new content
            const content = await Content.create(contentData)

            // Populate subject details
            await content.populate({
                path: "subject",
                populate: { path: "examLevel" },
            })

            return createResponse(res, StatusCodes.CREATED, content)
        } catch (error) {
            console.error("CREATE CONTENT ERROR:", error)
            return createResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message || "Failed to create content",
            )
        }
    },
)

// READ - Get all content (with filters)
router.get("/", async (req, res) => {
    try {
        const { subject, contentType, year, term, examLevel } = req.query

        const filter = { isActive: true }

        if (examLevel) {
            const subjects = await Subject.find({ examLevel, isActive: true })
            const subjectIds = subjects.map((s) => s._id)
            filter.subject = { $in: subjectIds }
        }

        if (subject) filter.subject = subject
        if (contentType) filter.contentType = contentType
        if (year) filter.year = parseInt(year)
        if (term) filter.term = term

        const contents = await Content.find(filter)
            .populate({ path: "subject", populate: { path: "examLevel" } })
            .sort({ createdAt: -1 })

        return createResponse(res, StatusCodes.OK, contents)
    } catch (error) {
        console.error("GET CONTENTS ERROR:", error)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch content")
    }
})

// READ - Get single content by ID
router.get("/:id", async (req, res) => {
    try {
        if (isInvalidId(res, req.params.id)) return

        const content = await Content.findById(req.params.id).populate({
            path: "subject",
            populate: { path: "examLevel" },
        })

        if (!content) {
            return createResponse(res, StatusCodes.NOT_FOUND, "Content not found")
        }

        content.views = (content.views || 0) + 1
        await content.save()

        return createResponse(res, StatusCodes.OK, content)
    } catch (error) {
        if (error.name === "CastError") return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID format")
        console.error("GET CONTENT ERROR:", error)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch content")
    }
})

// UPDATE - Update content (optional file replacement)
router.put(
    "/:id",
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "answerSheet", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            if (isInvalidId(res, req.params.id)) return

            const {
                title,
                subject,
                contentType,
                description,
                year,
                term,
                unit,
                tags,
                videoUrl,
                thumbnailUrl,
                isActive,
            } = req.body

            // Validate contentType if provided
            const validTypes = ["past_paper", "lesson", "short_notes", "lecture_video"]
            if (contentType && !validTypes.includes(contentType)) {
                return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid content type")
            }

            const updateData = {
                title,
                subject,
                contentType,
                description,
                year: year ? parseInt(year) : undefined,
                term,
                unit,
                tags: tags
                    ? Array.isArray(tags)
                        ? tags
                        : tags.split(",").map((t) => t.trim())
                    : undefined,
                videoUrl,
                thumbnailUrl,
                isActive,
            }

            // Replace main file if provided (smart routing)
            if (req.files?.file?.[0]) {
                const uploaded = await smartUpload(req.files.file[0], "content/files")
                Object.assign(updateData, mapUploadResultToFields(uploaded, "main"))
            }

            // Replace answer sheet if provided (smart routing)
            if (req.files?.answerSheet?.[0]) {
                const uploadedAns = await smartUpload(
                    req.files.answerSheet[0],
                    "content/answer-sheets",
                )
                Object.assign(updateData, mapUploadResultToFields(uploadedAns, "answerSheet"))
            }

            const content = await Content.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            }).populate({ path: "subject", populate: { path: "examLevel" } })

            if (!content) {
                return createResponse(res, StatusCodes.NOT_FOUND, "Content not found")
            }

            return createResponse(res, StatusCodes.OK, content)
        } catch (error) {
            if (error.name === "CastError") return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID format")
            if (error.name === "ValidationError") return createResponse(res, StatusCodes.BAD_REQUEST, error.message)
            console.error("UPDATE CONTENT ERROR:", error)
            return createResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message || "Failed to update content",
            )
        }
    },
)

// DELETE - Soft delete content
router.delete("/:id", async (req, res) => {
    try {
        if (isInvalidId(res, req.params.id)) return

        const content = await Content.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true },
        )

        if (!content) {
            return createResponse(res, StatusCodes.NOT_FOUND, "Content not found")
        }

        return createResponse(res, StatusCodes.OK, { message: "Content deleted successfully" })
    } catch (error) {
        if (error.name === "CastError") return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID format")
        console.error("DELETE CONTENT ERROR:", error)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete content")
    }
})

// ANALYTICS - Increment download count
router.post("/:id/download", async (req, res) => {
    try {
        if (isInvalidId(res, req.params.id)) return

        const content = await Content.findByIdAndUpdate(
            req.params.id,
            { $inc: { downloads: 1 } },
            { new: true },
        )

        if (!content) {
            return createResponse(res, StatusCodes.NOT_FOUND, "Content not found")
        }

        return createResponse(res, StatusCodes.OK, { message: "Download recorded" })
    } catch (error) {
        if (error.name === "CastError") return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID format")
        console.error("DOWNLOAD COUNT ERROR:", error)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to record download")
    }
})

module.exports = router