const express = require("express")
const router = express.Router()
const { StatusCodes } = require("http-status-codes")
const mongoose = require("mongoose")
const createResponse = require("../lib/createResponse")
const Subject = require("../models/Subject")
const ExamLevel = require("../models/ExamLevel")

// ─── Helper ───────────────────────────────────────────────────────────────────
function isInvalidId(res, id) {
    if (!mongoose.isValidObjectId(id)) {
        createResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID format")
        return true
    }
    return false
}

// CREATE - Add new subject
router.post("/", async (req, res) => {
    try {
        const { name, code, examLevel, opentdbCategory, description } = req.body

        // Validation — opentdbCategory added as required
        if (!name || !code || !examLevel || opentdbCategory === undefined) {
            return createResponse(
                res,
                StatusCodes.BAD_REQUEST,
                "Name, code, exam level, and opentdbCategory are required",
            )
        }

        // Validate examLevel ID format before hitting DB
        if (isInvalidId(res, examLevel)) return

        // Check if exam level exists
        const levelExists = await ExamLevel.findById(examLevel)
        if (!levelExists) {
            return createResponse(res, StatusCodes.NOT_FOUND, "Exam level not found")
        }

        // Check if subject already exists for this exam level
        const existingSubject = await Subject.findOne({ name, examLevel })
        if (existingSubject) {
            return createResponse(
                res,
                StatusCodes.CONFLICT,
                "Subject already exists for this exam level",
            )
        }

        // Create new subject
        const subject = await Subject.create({
            name,
            code: code.toUpperCase(),
            examLevel,
            opentdbCategory,
            description,
        })

        await subject.populate("examLevel")

        createResponse(res, StatusCodes.CREATED, subject)
    } catch (error) {
        console.error(error)
        if (error.code === 11000) {
            return createResponse(
                res,
                StatusCodes.CONFLICT,
                "Subject already exists for this exam level",
            )
        }
        createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create subject")
    }
})

// READ - Get all subjects (optionally filter by exam level)
router.get("/", async (req, res) => {
    try {
        const { examLevel } = req.query

        const filter = { isActive: true }
        if (examLevel) {
            filter.examLevel = examLevel
        }

        const subjects = await Subject.find(filter).populate("examLevel").sort({ name: 1 })

        createResponse(res, StatusCodes.OK, subjects)
    } catch (error) {
        console.error(error)
        createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch subjects")
    }
})

// READ - Get single subject by ID
router.get("/:id", async (req, res) => {
    try {
        if (isInvalidId(res, req.params.id)) return

        const subject = await Subject.findById(req.params.id).populate("examLevel")

        if (!subject) {
            return createResponse(res, StatusCodes.NOT_FOUND, "Subject not found")
        }

        createResponse(res, StatusCodes.OK, subject)
    } catch (error) {
        console.error(error)
        createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch subject")
    }
})

// UPDATE - Update subject
router.put("/:id", async (req, res) => {
    try {
        if (isInvalidId(res, req.params.id)) return

        const { name, code, examLevel, opentdbCategory, description, isActive } = req.body

        // Build update object with only provided fields to avoid overwriting with undefined
        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (code !== undefined) updateData.code = code.toUpperCase()
        if (examLevel !== undefined) updateData.examLevel = examLevel
        if (opentdbCategory !== undefined) updateData.opentdbCategory = opentdbCategory
        if (description !== undefined) updateData.description = description
        if (isActive !== undefined) updateData.isActive = isActive

        const subject = await Subject.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).populate("examLevel")

        if (!subject) {
            return createResponse(res, StatusCodes.NOT_FOUND, "Subject not found")
        }

        createResponse(res, StatusCodes.OK, subject)
    } catch (error) {
        if (error.code === 11000) {
            return createResponse(
                res,
                StatusCodes.CONFLICT,
                "Subject already exists for this exam level",
            )
        }
        console.error(error)
        createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update subject")
    }
})

// DELETE - Soft delete subject
router.delete("/:id", async (req, res) => {
    try {
        if (isInvalidId(res, req.params.id)) return

        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true },
        )

        if (!subject) {
            return createResponse(res, StatusCodes.NOT_FOUND, "Subject not found")
        }

        createResponse(res, StatusCodes.OK, { message: "Subject deleted successfully" })
    } catch (error) {
        console.error(error)
        createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete subject")
    }
})

module.exports = router