const { getReasonPhrase } = require("http-status-codes")

/**
 * Unified API response helper.
 *
 * Usage:
 *   createResponse(res, 200, { message: "OK", user })
 *   createResponse(res, 404, { message: "Not found" })
 *
 * Response shape:
 *   { success, statusMessage, body: { message, ...rest } }
 */
module.exports = (response, statusCode, body) => {
    let success = statusCode >= 200 && statusCode < 300
    let statusMessage = getReasonPhrase(statusCode)
    return response.status(statusCode).json({ success, statusMessage, body })
}