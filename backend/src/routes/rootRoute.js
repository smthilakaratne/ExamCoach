const express = require("express")
const createResponse = require("../lib/createResponse")
const { StatusCodes } = require("http-status-codes")
const router = express.Router()

/**
 * GET /
 * @summary API Root
 * @return {object} 200 - success response
 */
router.get("/", (req, res) => {
    createResponse(res, StatusCodes.OK, { version: "1.0.0" })
})

module.exports = router
