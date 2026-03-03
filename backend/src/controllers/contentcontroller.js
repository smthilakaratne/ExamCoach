// backend/controllers/contentController.js
const { StatusCodes } = require("http-status-codes")
const mongoose = require("mongoose")
const createResponse = require("../lib/createResponse")

const contentService = require("../services/contentService")

function handleError(res, error, fallbackMessage) {
    console.error(fallbackMessage, error)

    // Invalid Mongo ID -> 400
    if (error?.name === "CastError" || !mongoose.isValidObjectId(error?.value)) {
        return createResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID")
    }

    const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    const message = error.message || fallbackMessage
    return createResponse(res, status, message)
}

const create = async (req, res) => {
    try {
        const content = await contentService.createContent({ body: req.body, files: req.files })
        return createResponse(res, StatusCodes.CREATED, content)
    } catch (error) {
        return handleError(res, error, "Failed to create content")
    }
}

const getAll = async (req, res) => {
    try {
        const contents = await contentService.getAllContent(req.query)
        return createResponse(res, StatusCodes.OK, contents)
    } catch (error) {
        return handleError(res, error, "Failed to fetch content")
    }
}

const getOne = async (req, res) => {
    try {
        const content = await contentService.getContentById(req.params.id)
        return createResponse(res, StatusCodes.OK, content)
    } catch (error) {
        return handleError(res, error, "Failed to fetch content")
    }
}

const update = async (req, res) => {
    try {
        const content = await contentService.updateContent(req.params.id, {
            body: req.body,
            files: req.files,
        })
        return createResponse(res, StatusCodes.OK, content)
    } catch (error) {
        return handleError(res, error, "Failed to update content")
    }
}

const remove = async (req, res) => {
    try {
        await contentService.softDeleteContent(req.params.id)
        return createResponse(res, StatusCodes.OK, { message: "Content deleted successfully" })
    } catch (error) {
        return handleError(res, error, "Failed to delete content")
    }
}

const download = async (req, res) => {
    try {
        await contentService.recordDownload(req.params.id)
        return createResponse(res, StatusCodes.OK, { message: "Download recorded" })
    } catch (error) {
        return handleError(res, error, "Failed to record download")
    }
}

module.exports = {
    create,
    getAll,
    getOne,
    update,
    remove,
    download,
}