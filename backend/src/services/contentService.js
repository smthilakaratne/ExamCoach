// backend/services/contentService.js
const { StatusCodes } = require("http-status-codes")
const Content = require("../models/Content")
const Subject = require("../models/Subject")
const { uploadBufferToGridFS } = require("./gridfsService")

const validTypes = ["past_paper", "lesson", "short_notes", "lecture_video"]

function parseTags(tags) {
    if (!tags) return []
    if (Array.isArray(tags)) return tags
    return tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
}

async function ensureSubjectExists(subjectId) {
    const subjectExists = await Subject.findById(subjectId)
    if (!subjectExists) {
        const err = new Error("Subject not found")
        err.statusCode = StatusCodes.NOT_FOUND
        throw err
    }
}

function validateContentType(contentType) {
    if (!validTypes.includes(contentType)) {
        const err = new Error("Invalid content type")
        err.statusCode = StatusCodes.BAD_REQUEST
        throw err
    }
}

async function createContent({ body, files }) {
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
    } = body

    // Validation
    if (!title || !subject || !contentType) {
        const err = new Error("Title, subject, and content type are required")
        err.statusCode = StatusCodes.BAD_REQUEST
        throw err
    }

    await ensureSubjectExists(subject)
    validateContentType(contentType)

    // If not video, require a file
    if (contentType !== "lecture_video" && !files?.file?.[0]) {
        const err = new Error("PDF file is required")
        err.statusCode = StatusCodes.BAD_REQUEST
        throw err
    }

    const contentData = {
        title,
        subject,
        contentType,
        description,
        year: year ? parseInt(year) : undefined,
        term: term || "",
        unit,
        tags: parseTags(tags),
        videoUrl,
        thumbnailUrl,
    }

    // Main file upload
    if (files?.file?.[0]) {
        const uploaded = await uploadBufferToGridFS(files.file[0])
        if (!uploaded || !uploaded._id) {
            const err = new Error("GridFS upload failed: main file did not return _id")
            err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            throw err
        }

        contentData.fileId = uploaded._id
        contentData.fileName = uploaded.filename
        contentData.fileType = uploaded.contentType
        contentData.fileSize = uploaded.length
    }

    // Answer sheet upload (optional)
    if (files?.answerSheet?.[0]) {
        const uploadedAns = await uploadBufferToGridFS(files.answerSheet[0])
        if (!uploadedAns || !uploadedAns._id) {
            const err = new Error("GridFS upload failed: answer sheet did not return _id")
            err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            throw err
        }

        contentData.hasAnswerSheet = true
        contentData.answerSheetFileId = uploadedAns._id
        contentData.answerSheetFileName = uploadedAns.filename
    }

    const content = await Content.create(contentData)

    await content.populate({
        path: "subject",
        populate: { path: "examLevel" },
    })

    return content
}

async function getAllContent(query) {
    const { subject, contentType, year, term, examLevel } = query
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

    return contents
}

async function getContentById(id) {
    const content = await Content.findById(id).populate({
        path: "subject",
        populate: { path: "examLevel" },
    })

    if (!content) {
        const err = new Error("Content not found")
        err.statusCode = StatusCodes.NOT_FOUND
        throw err
    }

    // views++
    content.views = (content.views || 0) + 1
    await content.save()

    return content
}

async function updateContent(id, { body, files }) {
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
    } = body

    // Build update object carefully
    const updateData = {}

    if (title !== undefined) updateData.title = title
    if (subject !== undefined) {
        await ensureSubjectExists(subject)
        updateData.subject = subject
    }
    if (contentType !== undefined) {
        validateContentType(contentType)
        updateData.contentType = contentType
    }
    if (description !== undefined) updateData.description = description
    if (year !== undefined) updateData.year = year ? parseInt(year) : undefined
    if (term !== undefined) updateData.term = term
    if (unit !== undefined) updateData.unit = unit
    if (tags !== undefined) updateData.tags = parseTags(tags)
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl
    if (isActive !== undefined) updateData.isActive = isActive

    // Replace main file
    if (files?.file?.[0]) {
        const uploaded = await uploadBufferToGridFS(files.file[0])
        updateData.fileId = uploaded._id
        updateData.fileName = uploaded.filename
        updateData.fileType = uploaded.contentType
        updateData.fileSize = uploaded.length
    }

    // Replace answer sheet
    if (files?.answerSheet?.[0]) {
        const uploadedAns = await uploadBufferToGridFS(files.answerSheet[0])
        updateData.hasAnswerSheet = true
        updateData.answerSheetFileId = uploadedAns._id
        updateData.answerSheetFileName = uploadedAns.filename
    }

    const content = await Content.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).populate({ path: "subject", populate: { path: "examLevel" } })

    if (!content) {
        const err = new Error("Content not found")
        err.statusCode = StatusCodes.NOT_FOUND
        throw err
    }

    return content
}

async function softDeleteContent(id) {
    const content = await Content.findByIdAndUpdate(id, { isActive: false }, { new: true })
    if (!content) {
        const err = new Error("Content not found")
        err.statusCode = StatusCodes.NOT_FOUND
        throw err
    }
    return true
}

async function recordDownload(id) {
    const content = await Content.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true })
    if (!content) {
        const err = new Error("Content not found")
        err.statusCode = StatusCodes.NOT_FOUND
        throw err
    }
    return true
}

module.exports = {
    createContent,
    getAllContent,
    getContentById,
    updateContent,
    softDeleteContent,
    recordDownload,
}