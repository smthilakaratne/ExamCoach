const express = require("express")
const router = express.Router()
const { StatusCodes } = require("http-status-codes")
const createResponse = require("../lib/createResponse")
const ExamLevel = require("../models/ExamLevel")

// CREATE - Add new exam level
router.post("/", async (req, res) => {
    try {
        const { name, code, description } = req.body

        // Validation
        if (!name || !code) {
            return createResponse(res, StatusCodes.BAD_REQUEST, "Name and code are required")
        }

        // Check if already exists
        const existingLevel = await ExamLevel.findOne({
            $or: [{ code: code.toUpperCase() }, { name }],
        })

        if (existingLevel) {
            return createResponse(res, StatusCodes.CONFLICT, "Exam level already exists")
        }

        // Create new exam level
        const examLevel = await ExamLevel.create({
            name,
            code: code.toUpperCase(),
            description,
        })

        createResponse(res, StatusCodes.CREATED, examLevel)
    } catch (error) {
        console.error(error)
        createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create exam level")
    }
})

// READ - Get all exam levels
router.get("/", async (req, res) => {
    try {
        const examLevels = await ExamLevel.find({ isActive: true }).sort({ createdAt: -1 })
        createResponse(res, StatusCodes.OK, examLevels)
    } catch (error) {
        console.error(error)
        createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch exam levels")
    }
})

// READ - Get single exam level by ID
router.get("/:id", async (req, res) => {
    try {
        const examLevel = await ExamLevel.findById(req.params.id)

        if (!examLevel) {
            return createResponse(res, StatusCodes.NOT_FOUND, "Exam level not found")
        }

        createResponse(res, StatusCodes.OK, examLevel)
    } catch (error) {
        console.error(error)
        createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch exam level")
    }
})

// UPDATE - Update exam level
router.put("/:id", async (req, res) => {
    try {
        const { name, code, description, isActive } = req.body

        const examLevel = await ExamLevel.findByIdAndUpdate(
            req.params.id,
            {
                name,
                code: code?.toUpperCase(),
                description,
                isActive,
            },
            { new: true, runValidators: true },
        )

        if (!examLevel) {
            return createResponse(res, StatusCodes.NOT_FOUND, "Exam level not found")
        }

        createResponse(res, StatusCodes.OK, examLevel)
    } catch (error) {
        console.error(error)
        createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update exam level")
    }
})

// DELETE - Soft delete exam level (set isActive to false)
router.delete("/:id", async (req, res) => {
    try {
        const examLevel = await ExamLevel.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true },
        )

        if (!examLevel) {
            return createResponse(res, StatusCodes.NOT_FOUND, "Exam level not found")
        }

        createResponse(res, StatusCodes.OK, { message: "Exam level deleted successfully" })
    } catch (error) {
        console.error(error)
        createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete exam level")
    }
})

module.exports = router
