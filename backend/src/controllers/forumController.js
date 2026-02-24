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
        next(err)
    }
}

const getThread = async (req, res, next) => {
    try {
        const threadId = req.params.id
        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        const thread = await ForumThread.findById(threadId)
        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        console.error(error)
        next(error)
    }
}

module.exports = { getThreads, createThread, getThread }
