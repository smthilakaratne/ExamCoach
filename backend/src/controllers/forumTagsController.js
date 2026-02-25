const { StatusCodes } = require("http-status-codes")
const createResponse = require("../lib/createResponse")
const ForumTag = require("../models/ForumTag")

const getTags = async (req, res, next) => {
    try {
        const tags = await ForumTag.find({})
        return createResponse(res, StatusCodes.OK, { tags })
    } catch (error) {
        console.error(error)
        next(error)
    }
}

const createTag = async (req, res, next) => {
    try {
        const tag = await ForumTag.create({ ...req.body })
        return createResponse(res, StatusCodes.CREATED, { tag })
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

module.exports = { getTags, createTag }
