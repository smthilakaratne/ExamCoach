const express = require("express")
const createResponse = require("../lib/createResponse")
const { StatusCodes } = require("http-status-codes")
const router = express.Router()

/**
 * @openapi
 * /:
 *   get:
 *     summary: API Root
 *     responses:
 *         200:
 *            description: OK
 *
 */
router.get("/", (req, res) => {
    createResponse(res, StatusCodes.OK, { version: "1.0.0" })
})

module.exports = router
