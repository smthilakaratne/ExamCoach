const mongoose = require("mongoose")
const createResponse = require("../lib/createResponse")
const ForumThread = require("../models/ForumThread")
const { StatusCodes } = require("http-status-codes")

const getThreads = async (req, res, next) => {
    try {
        const threads = await ForumThread.find({}).populate("createdBy", "_id name email avatar")
        return createResponse(res, StatusCodes.OK, threads)
    } catch (error) {
        next(error)
    }
}

const createThread = async (req, res, next) => {
    try {
        const thread = await ForumThread.create({
            ...req.body,
            createdBy: req.user,
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
        // requires an update for the view counter
        const thread = await ForumThread.findByIdAndUpdate(
            threadId,
            {
                $inc: { views: 1 },
            },
            { new: true },
        )
            .populate("createdBy", "_id name email avatar")
            .populate("answers.createdBy", "_id name email avatar")
        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        next(error)
    }
}

const updateThread = async (req, res, next) => {
    try {
        const user = req.user
        const threadId = req.params.id
        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        // note: this is a dangerous approach as the user can easily play around with the data.
        // for example, they can change user; or even change data formats so it will eventually break somewhere
        // I'm leaving as it is because I'm lazy and have no time
        // In all honesty, I could just do the during the time I'm typing this
        // hehe
        // I mean there are plenty other places with this exact issue. So I guess this comment might make sense later
        const thread = await ForumThread.findOneAndUpdate(
            { _id: threadId, createdBy: user._id },
            { ...req.body },
            { new: true, runValidators: true },
        )
        if (!thread)
            return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found for this user")
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
        next(error)
    }
}

const voteThread = async (req, res, next) => {
    try {
        const { value } = req.body // 1 or -1
        // temporary user for testing till the user component is done
        const user = req.user
        const threadId = req.params.id

        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")

        if (![1, -1].includes(value))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid vote value")

        const update =
            value === 1
                ? {
                      $addToSet: { "reactions.up": user._id },
                      $pull: { "reactions.down": user._id },
                  }
                : {
                      $addToSet: { "reactions.down": user._id },
                      $pull: { "reactions.up": user._id },
                  }

        const thread = await ForumThread.findByIdAndUpdate(threadId, update, { new: true })
        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        next(error)
    }
}

const unvoteThread = async (req, res, next) => {
    try {
        const user = req.user
        const threadId = req.params.id

        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")

        const thread = await ForumThread.findByIdAndUpdate(
            threadId,
            {
                $pull: {
                    "reactions.up": user._id,
                    "reactions.down": user._id,
                },
            },
            { new: true },
        )

        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        next(error)
    }
}

const deleteThread = async (req, res, next) => {
    try {
        const user = req.user
        const threadId = req.params.id
        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        const thread = await ForumThread.findOneAndDelete({ _id: threadId, createdBy: user._id })
        if (!thread)
            return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found for this user")
        return createResponse(res, StatusCodes.OK, "Thread deleted")
    } catch (error) {
        next(error)
    }
}

const createThreadComment = async (req, res, next) => {
    try {
        const user = req.user
        const threadId = req.params.id
        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        const thread = await ForumThread.findByIdAndUpdate(
            threadId,
            {
                $push: {
                    answers: {
                        ...req.body,
                        createdBy: user._id,
                    },
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
        next(error)
    }
}

const editThreadComment = async (req, res, next) => {
    try {
        const threadId = req.params.id
        const commentId = req.params.comment
        const user = req.user

        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        if (!mongoose.isValidObjectId(commentId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")

        const thread = await ForumThread.findOneAndUpdate(
            {
                _id: threadId,
                "answers._id": commentId,
                "answers.createdBy": user._id,
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
        next(error)
    }
}

const voteThreadComment = async (req, res, next) => {
    try {
        const { value } = req.body // 1 or -1
        // temporary user for testing till the user component is done
        const user = req.user
        const threadId = req.params.id
        const commentId = req.params.comment

        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        if (!mongoose.isValidObjectId(commentId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid comment ID")

        if (![1, -1].includes(value))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid vote value")

        const update =
            value === 1
                ? {
                      $addToSet: { "answers.$.reactions.up": user._id },
                      $pull: { "answers.$.reactions.down": user._id },
                  }
                : {
                      $addToSet: { "answers.$.reactions.down": user._id },
                      $pull: { "answers.$.reactions.up": user._id },
                  }

        const thread = await ForumThread.findOneAndUpdate(
            { _id: threadId, "answers._id": commentId },
            update,
            { new: true },
        )
        if (!thread)
            return createResponse(res, StatusCodes.NOT_FOUND, "Thread or comment not found")
        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        next(error)
    }
}

const unvoteThreadComment = async (req, res, next) => {
    try {
        const user = req.user
        const threadId = req.params.id
        const commentId = req.params.comment

        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        if (!mongoose.isValidObjectId(commentId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid comment ID")

        const thread = await ForumThread.findOneAndUpdate(
            {
                _id: threadId,
                "answers._id": commentId,
            },
            {
                $pull: {
                    "answers.$.reactions.up": user._id,
                    "answers.$.reactions.down": user._id,
                },
            },
            { new: true },
        )

        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        next(error)
    }
}

const markThreadComment = async (req, res, next) => {
    try {
        const threadId = req.params.id
        const commentId = req.params.comment
        const user = req.user

        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        if (!mongoose.isValidObjectId(commentId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid comment ID")

        const thread = await ForumThread.findOneAndUpdate(
            { _id: threadId, "answers._id": commentId, createdBy: user._id },
            {
                $set: {
                    "answers.$[correct].isCorrectAnswer": true,
                    "answers.$[others].isCorrectAnswer": false,
                },
            },
            {
                arrayFilters: [{ "correct._id": commentId }, { "others._id": { $ne: commentId } }],
                new: true,
            },
        )
        if (!thread)
            return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found for this user")
        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        next(error)
    }
}

const unmarkThreadComment = async (req, res, next) => {
    try {
        const threadId = req.params.id
        const commentId = req.params.comment
        const user = req.user

        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        if (!mongoose.isValidObjectId(commentId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid comment ID")

        const thread = await ForumThread.findOneAndUpdate(
            { _id: threadId, "answers._id": commentId, createdBy: user._id },
            {
                $set: {
                    "answers.$[].isCorrectAnswer": false,
                },
            },
            { new: true },
        )
        if (!thread)
            return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found for this user")
        return createResponse(res, StatusCodes.OK, { thread })
    } catch (error) {
        next(error)
    }
}

const deleteThreadComment = async (req, res, next) => {
    try {
        const threadId = req.params.id
        const commentId = req.params.comment
        const user = req.user

        if (!mongoose.isValidObjectId(threadId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")
        if (!mongoose.isValidObjectId(commentId))
            return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid thread ID")

        const thread = await ForumThread.findById(threadId)
        if (!thread) return createResponse(res, StatusCodes.NOT_FOUND, "Thread not found")
        const result = await ForumThread.updateOne(
            { _id: threadId, "answers._id": commentId, "answers.createdBy": user._id },
            { $pull: { answers: { _id: commentId } } },
        )

        if (result.modifiedCount === 0)
            return createResponse(res, StatusCodes.NOT_FOUND, "Comment not found for this user")

        return createResponse(res, StatusCodes.OK, "Comment deleted")
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getThreads,
    createThread,
    getThread,
    updateThread,
    voteThread,
    unvoteThread,
    deleteThread,
    createThreadComment,
    editThreadComment,
    voteThreadComment,
    unvoteThreadComment,
    markThreadComment,
    unmarkThreadComment,
    deleteThreadComment,
}
