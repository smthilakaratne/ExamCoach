const express = require("express")
const router = express.Router()

const {
    getThreads,
    createThread,
    getThread,
    createThreadComment,
    deleteThread,
    updateThread,
    deleteThreadComment,
    editThreadComment,
    voteThread,
    unvoteThread,
    voteThreadComment,
    unvoteThreadComment,
} = require("../controllers/forumController")
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

/**
 * PUT /api/forum/{id}
 * @summary Update a forum thread by id
 * @tags forum
 * @param {string} id.path.required Thread id
 * @param {ForumThread} request.body
 * @return {ForumThread} 200 - Forum thread - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.put("/:id", updateThread)

/**
 * POST /api/forum/{id}/vote
 * @summary Cast an upvote/downvote on a thread by id
 * @param {object} request.body
 * @return {ForumThread} 200 - OK - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.post("/:id/vote", voteThread)

/**
 * DELETE /api/forum/{id}/vote
 * @summary Remove an upvote/downvote from a thread
 * @return {ForumThread} 200 - OK - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.delete("/:id/vote", unvoteThread)

/**
 * DELETE /api/forum/{id}
 * @summary Delete a forum thread by id
 * @tags forum
 * @param {string} id.path Thread id
 * @return {object} 200 - Thread deleted - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.delete("/:id", deleteThread)

/**
 * POST /api/forum/{id}/comments
 * @summary Post a comment on a thread
 * @tags forum
 * @param {string} id.path Thread id
 * @param {ForumThreadAnswer} request.body
 * @return {ForumThread} 201 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 500 - Internal Server Error - applicatiosn/json
 */
router.post("/:id/comments", createThreadComment)

/**
 * PATCH /api/forum/{id}/comments/{comment}
 * @summary Edit a comment from a thread
 * @tags forum
 * @param {string} id.path.required Thread id
 * @param {string} comment.path.required Comment id
 * @param {ForumThreadAnswer} request.body
 * @return {ForumThreadAnswer} 200 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 500 - Internal Server Error - applicatiosn/json
 */
router.patch("/:id/comments/:comment", editThreadComment)

/**
 * POST /api/forum/{id}/comments/{comment}/vote
 * @summary Cast a vote to a comment from a thread
 * @tags forum
 * @param {string} id.path.required Thread id
 * @param {string} comment.path.required Comment id
 * @param {object} request.body
 * @return {ForumThreadAnswer} 200 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 500 - Internal Server Error - applicatiosn/json
 */
router.post("/:id/comments/:comment/vote", voteThreadComment)

/**
 * DELETE /api/forum/{id}/comments/{comment}/vote
 * @summary Remove an upvote/downvote from a thread comment
 * @return {ForumThread} 200 - OK - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.delete("/:id/comments/:comment/vote", unvoteThreadComment)

/**
 * DELETE /api/forum/{id}/comments/{comment}
 * @summary Delete a comment from a thread
 * @tags forum
 * @param {string} id.path.required Thread id
 * @param {number} comment.path.required Comment id
 * @return {object} 200 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 500 - Internal Server Error - applicatiosn/json
 */
router.delete("/:id/comments/:comment", deleteThreadComment)

module.exports = router
