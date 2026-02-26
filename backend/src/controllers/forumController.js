const mongoose = require("mongoose")
const createResponse = require("../lib/createResponse")
const ForumThread = require("../models/ForumThread")
const { StatusCodes } = require("http-status-codes")

const getThreads = async (req, res, next) => {
    try {
        const threads = await ForumThread.find({})
        return createResponse(res, StatusCodes.OK, threads)
    } catch (error) {
        console.error(error)
        next(error)
    }
}

const createThread = async (req, res, next) => {
    try {
        const thread = await ForumThread.create({
            ...req.body,
            createdBy: { name: "Sample user" },
        })
        return createResponse(res, StatusCodes.CREATED, { thread })
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError)
            return createResponse(
                res,
                StatusCodes.BAD_REQUEST,
                Object.keys(error.errors).map((key) => ({
                    field: key,
                    message: error.errors[key].message,
                })),
            )
        console.error(error)
        next(err)
    }
}

const getThread = async (req, res, next) => {
    try {
        const threadId = req.params.id
        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        // requires an update for the view counter
        const thread = await ForumThread.findByIdAndUpdate(
            threadId,
            {
                $inc: { views: 1 },
            },
            { new: true },
        )
        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        console.error(error)
        next(error)
    }
}

const updateThread = async (req, res, next) => {
    try {
        const threadId = req.params.id
        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        // note: this is a dangerous approach as the user can easily play around with the data.
        // for example, they can change user; or even change data formats so it will eventually break somewhere
        // I'm leaving as it is because I'm lazy and have no time
        // In all honesty, I could just do the during the time I'm typing this
        // hehe
        // I mean there are plenty other places with this exact issue. So I guess this comment might make sense later
        const thread = await ForumThread.findByIdAndUpdate(
            threadId,
            { ...req.body },
            { new: true, runValidators: true },
        )
        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError)
            return createResponse(
                res,
                StatusCodes.BAD_REQUEST,
                Object.keys(error.errors).map((key) => ({
                    field: key,
                    message: error.errors[key].message,
                })),
            )
        console.error(error)
        next(error)
    }
}

const deleteThread = async (req, res, next) => {
    try {
        const threadId = req.params.id
        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        const thread = await ForumThread.findByIdAndDelete(threadId)
        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        return createResponse(res, StatusCodes.OK, "Thread deleted")
    } catch (error) {
        console.error(error)
        next(error)
    }
}

const createThreadComment = async (req, res, next) => {
    try {
        const threadId = req.params.id
        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        const thread = await ForumThread.findByIdAndUpdate(
            threadId,
            {
                $push: {
                    answers: { ...req.body, createdBy: { name: "Sample user" } },
                },
            },
            { new: true, runValidators: true },
        )
        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        return createResponse(res, StatusCodes.CREATED, { thread })
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError)
            return createResponse(
                res,
                StatusCodes.BAD_REQUEST,
                Object.keys(error.errors).map((key) => ({
                    field: key,
                    message: error.errors[key].message,
                })),
            )
        console.error(error)
        next(error)
    }
}

const editThreadComment = async (req, res, next) => {
    try {
        const threadId = req.params.id
        const commentId = req.params.comment

        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        if (!mongoose.isValidObjectId(commentId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")

        const thread = await ForumThread.findOneAndUpdate(
            {
                _id: threadId,
                "answers._id": commentId,
            },
            {
                $set: {
                    "answers.$.body": req.body.body,
                },
            },
            { new: true, runValidators: true },
        )
        if (!thread)
            return createResponse(res, StatusCodes.NOT_FOUND, "Thread or comment not found")

        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        console.error(error)
        next(error)
    }
}

const deleteThreadComment = async (req, res, next) => {
    try {
        const threadId = req.params.id
        const commentId = req.params.comment

        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        if (!mongoose.isValidObjectId(commentId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")

        const thread = await ForumThread.findById(threadId)
        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        const result = await ForumThread.updateOne(
            { _id: threadId, "answers._id": commentId },
            { $pull: { answers: { _id: commentId } } },
        )

        if (result.modifiedCount === 0)
            return createResponse(res, StatusCodes.NOT_FOUND, "Comment not found")

        return createResponse(res, StatusCodes.OK, "Comment deleted")
    } catch (error) {
        console.error(error)
        next(error)
    }
}

module.exports = {
    getThreads,
    createThread,
    getThread,
    updateThread,
    deleteThread,
    createThreadComment,
    editThreadComment,
    deleteThreadComment,
}
