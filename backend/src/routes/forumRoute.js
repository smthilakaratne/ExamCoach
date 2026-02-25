const express = require("express")
const router = express.Router()

const { getThreads, createThread, getThread } = require("../controllers/forumController")
const ForumThread = require("../models/ForumThread")

/**
 * GET /api/forum
 * @summary Get all forum threads
 * @tags forum
 * @return {ForumThread[]} 200 - Forum threads - application/json 
 * @return {object} 500 - Internal Server Error - application/json
 */
router.get("/", getThreads)

/**
 * POST /api/forum
 * @summary Create a forum thread
 * @tags forum
 * @param {ForumThread} request.body
 * @return {object} 201 - Created - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 500 - Internal Server Error - application/json
 * @example response - 201 - success response example
 * [
 *   {
 *     "title": "Sample title",
 *     "body": "Sample body",
 *     "tags": []
 *   }
 * ]
 */
router.post("/", createThread)

/**
 * GET /api/forum/{id}
 * @summary Get a forum thread by id
 * @tags forum
 * @param {string} id.path Thread id
 * @return {ForumThread} 200 - Forum thread - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.get("/:id", getThread)

module.exports = router
