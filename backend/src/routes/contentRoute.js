// backend/routes/contentRoute.js
const express = require("express")
const router = express.Router()
const { StatusCodes } = require("http-status-codes")
const mongoose = require("mongoose")

const createResponse = require("../lib/createResponse")
const Content = require("../models/Content")
const Subject = require("../models/Subject")

const { upload, getGridFsBucket } = require("../config/gridfs")

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
            const result = {
                _id: uploadStream.id,
                filename: uploadStream.filename,
                contentType: file.mimetype,
                length: file.size,
            }
            console.log("✅ GridFS finished:", result)
            resolve(result)
        })

        uploadStream.end(file.buffer)
    })
}

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

            // Handle main file upload
            if (req.files?.file?.[0]) {
                const uploaded = await uploadBufferToGridFS(req.files.file[0])

                if (!uploaded || !uploaded._id) {
                    throw new Error("GridFS upload failed: main file did not return _id")
                }

                contentData.fileId = uploaded._id
                contentData.fileName = uploaded.filename
                contentData.fileType = uploaded.contentType
                contentData.fileSize = uploaded.length
            }

            // Handle answer sheet upload (optional)
            if (req.files?.answerSheet?.[0]) {
                const uploadedAns = await uploadBufferToGridFS(req.files.answerSheet[0])

                if (!uploadedAns || !uploadedAns._id) {
                    throw new Error("GridFS upload failed: answer sheet did not return _id")
                }

                contentData.hasAnswerSheet = true
                contentData.answerSheetFileId = uploadedAns._id
                contentData.answerSheetFileName = uploadedAns.filename
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

            // Replace main file if provided
            if (req.files?.file?.[0]) {
                const uploaded = await uploadBufferToGridFS(req.files.file[0])
                updateData.fileId = uploaded._id
                updateData.fileName = uploaded.filename
                updateData.fileType = uploaded.contentType
                updateData.fileSize = uploaded.length
            }

            // Replace answer sheet if provided
            if (req.files?.answerSheet?.[0]) {
                const uploadedAns = await uploadBufferToGridFS(req.files.answerSheet[0])
                updateData.hasAnswerSheet = true
                updateData.answerSheetFileId = uploadedAns._id
                updateData.answerSheetFileName = uploadedAns.filename
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
        console.error("DELETE CONTENT ERROR:", error)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete content")
    }
})

// ANALYTICS - Increment download count
router.post("/:id/download", async (req, res) => {
    try {
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
        console.error("DOWNLOAD COUNT ERROR:", error)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to record download")
    }
})

module.exports = router
