const { validationResult } = require("express-validator")
const { StatusCodes } = require("http-status-codes")

const Feedback = require("../models/Feedback")
const createResponse = require("../lib/createResponse")

const handleValidation = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        createResponse(res, StatusCodes.UNPROCESSABLE_ENTITY, {
            message: "Validation failed",
            errors: errors.array(),
        })
        return false
    }
    return true
}

// ── POST /api/feedback ────────────────────────────────────────────────────────
const createFeedback = async (req, res) => {
    try {
        if (!handleValidation(req, res)) return

        const { title, content, category, isPublic } = req.body
        const feedback = await Feedback.create({
            author: req.user.id,
            title,
            content,
            category: category || "general",
            isPublic: isPublic !== undefined ? isPublic : true,
        })

        await feedback.populate("author", "name email avatar role")
        return createResponse(res, StatusCodes.CREATED, {
            message: "Feedback submitted successfully",
            feedback,
        })
    } catch (err) {
        console.error("Create feedback error:", err)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── GET /api/feedback ─────────────────────────────────────────────────────────
const getAllFeedback = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, status, search, sort = "-createdAt" } = req.query
        const query = {}

        // Students only see public feedback; admins see all
        if (req.user.role !== "admin") query.isPublic = true

        if (category) query.category = category
        if (status && req.user.role === "admin") query.status = status
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
            ]
        }

        const skip = (Number(page) - 1) * Number(limit)
        const [feedbacks, total] = await Promise.all([
            Feedback.find(query)
                .populate("author", "name email avatar role")
                .populate("replies.author", "name email avatar role")
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            Feedback.countDocuments(query),
        ])

        return createResponse(res, StatusCodes.OK, {
            message: "Feedback list fetched",
            feedbacks,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── GET /api/feedback/my ──────────────────────────────────────────────────────
const getMyFeedback = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const skip = (Number(page) - 1) * Number(limit)
        const [feedbacks, total] = await Promise.all([
            Feedback.find({ author: req.user.id })
                .populate("replies.author", "name email avatar role")
                .sort("-createdAt")
                .skip(skip)
                .limit(Number(limit)),
            Feedback.countDocuments({ author: req.user.id }),
        ])
        return createResponse(res, StatusCodes.OK, {
            message: "Your feedback fetched",
            feedbacks,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── GET /api/feedback/stats (admin) ───────────────────────────────────────────
const getFeedbackStats = async (req, res) => {
    try {
        const [total, pending, reviewed, resolved, rejected, categoryBreakdown] = await Promise.all([
            Feedback.countDocuments(),
            Feedback.countDocuments({ status: "pending" }),
            Feedback.countDocuments({ status: "reviewed" }),
            Feedback.countDocuments({ status: "resolved" }),
            Feedback.countDocuments({ status: "rejected" }),
            Feedback.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
        ])
        return createResponse(res, StatusCodes.OK, {
            message: "Feedback stats fetched",
            total,
            pending,
            reviewed,
            resolved,
            rejected,
            categoryBreakdown,
        })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── GET /api/feedback/:id ─────────────────────────────────────────────────────
const getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
            .populate("author", "name email avatar role")
            .populate("replies.author", "name email avatar role")

        if (!feedback) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "Feedback not found" })
        }

        const isAuthor = feedback.author._id.toString() === req.user.id
        if (!feedback.isPublic && req.user.role !== "admin" && !isAuthor) {
            return createResponse(res, StatusCodes.FORBIDDEN, { message: "Access denied" })
        }

        return createResponse(res, StatusCodes.OK, { message: "Feedback fetched", feedback })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── PUT /api/feedback/:id ─────────────────────────────────────────────────────
const updateFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
        if (!feedback) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "Feedback not found" })
        }

        const isAuthor = feedback.author.toString() === req.user.id

        if (req.user.role === "admin") {
            if (req.body.status !== undefined) feedback.status = req.body.status
            if (req.body.adminNote !== undefined) feedback.adminNote = req.body.adminNote
        } else {
            if (!isAuthor) {
                return createResponse(res, StatusCodes.FORBIDDEN, {
                    message: "You can only edit your own feedback",
                })
            }
            if (feedback.status !== "pending") {
                return createResponse(res, StatusCodes.BAD_REQUEST, {
                    message: "Cannot edit feedback that has already been reviewed",
                })
            }
            if (req.body.title) { feedback.title = req.body.title; feedback.isEdited = true }
            if (req.body.content) { feedback.content = req.body.content; feedback.isEdited = true }
            if (req.body.category) feedback.category = req.body.category
            if (req.body.isPublic !== undefined) feedback.isPublic = req.body.isPublic
        }

        await feedback.save()
        await feedback.populate("author", "name email avatar role")
        return createResponse(res, StatusCodes.OK, { message: "Feedback updated", feedback })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── DELETE /api/feedback/:id ──────────────────────────────────────────────────
const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
        if (!feedback) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "Feedback not found" })
        }

        const isAuthor = feedback.author.toString() === req.user.id
        if (req.user.role !== "admin" && !isAuthor) {
            return createResponse(res, StatusCodes.FORBIDDEN, {
                message: "You can only delete your own feedback",
            })
        }

        await Feedback.findByIdAndDelete(req.params.id)
        return createResponse(res, StatusCodes.OK, { message: "Feedback deleted successfully" })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── POST /api/feedback/:id/reply ──────────────────────────────────────────────
const addReply = async (req, res) => {
    try {
        if (!handleValidation(req, res)) return

        const feedback = await Feedback.findById(req.params.id)
        if (!feedback) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "Feedback not found" })
        }

        const isAuthor = feedback.author.toString() === req.user.id
        if (!feedback.isPublic && req.user.role !== "admin" && !isAuthor) {
            return createResponse(res, StatusCodes.FORBIDDEN, { message: "Access denied" })
        }

        feedback.replies.push({ author: req.user.id, content: req.body.content })

        // Auto-mark as reviewed when admin replies
        if (req.user.role === "admin" && feedback.status === "pending") {
            feedback.status = "reviewed"
        }

        await feedback.save()
        await feedback.populate("author", "name email avatar role")
        await feedback.populate("replies.author", "name email avatar role")
        return createResponse(res, StatusCodes.CREATED, { message: "Reply added", feedback })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── DELETE /api/feedback/:id/reply/:replyId ───────────────────────────────────
const deleteReply = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
        if (!feedback) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "Feedback not found" })
        }

        const reply = feedback.replies.id(req.params.replyId)
        if (!reply) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "Reply not found" })
        }

        const isReplyAuthor = reply.author.toString() === req.user.id
        if (req.user.role !== "admin" && !isReplyAuthor) {
            return createResponse(res, StatusCodes.FORBIDDEN, {
                message: "You can only delete your own replies",
            })
        }

        feedback.replies.pull({ _id: req.params.replyId })
        await feedback.save()
        return createResponse(res, StatusCodes.OK, { message: "Reply deleted" })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── POST /api/feedback/:id/react ──────────────────────────────────────────────
const reactToFeedback = async (req, res) => {
    try {
        const { type } = req.body
        const validTypes = ["like", "helpful", "agree", "disagree"]
        if (!validTypes.includes(type)) {
            return createResponse(res, StatusCodes.BAD_REQUEST, {
                message: `Reaction type must be one of: ${validTypes.join(", ")}`,
            })
        }

        const feedback = await Feedback.findById(req.params.id)
        if (!feedback) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "Feedback not found" })
        }

        const existingIndex = feedback.reactions.findIndex(
            (r) => r.user.toString() === req.user.id
        )

        if (existingIndex !== -1) {
            if (feedback.reactions[existingIndex].type === type) {
                // Toggle off — remove the reaction
                feedback.reactions.splice(existingIndex, 1)
            } else {
                // Change to new type
                feedback.reactions[existingIndex].type = type
            }
        } else {
            feedback.reactions.push({ user: req.user.id, type })
        }

        await feedback.save()
        return createResponse(res, StatusCodes.OK, {
            message: "Reaction updated",
            reactionSummary: feedback.reactionSummary,
            totalReactions: feedback.reactions.length,
        })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

module.exports = {
    createFeedback,
    getAllFeedback,
    getMyFeedback,
    getFeedbackStats,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
    addReply,
    deleteReply,
    reactToFeedback,
}