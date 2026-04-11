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
    markThreadComment,
    unmarkThreadComment,
} = require("../controllers/forumController")
const { protect } = require("../app")
const ForumThread = require("../models/ForumThread")

/**
 * GET /api/forum
 * @summary Get all forum threads
 * @tags forum
 * @param {string} q.query - Query string
 * @param {string} tags.query - List of comma-separated tags
 * @return {ForumThread[]} 200 - Forum threads - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.get("/", getThreads)

/**
 * POST /api/forum
 * @summary Create a forum thread
 * @description Create a forum thread. Optionally specify tags as an array
 * @tags forum
 * @param {ForumThread} request.body
 * @return {object} 201 - Created - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 500 - Internal Server Error - application/json
*/
router.post("/", protect, createThread)

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
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 404 - Thread not found for this user - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.put("/:id", protect, updateThread)

/**
 * Vote request body
 * @typedef {object} Vote
 * @property {number} value.required - 1 (upvote) or -1 (downvote)
 */

/**
 * POST /api/forum/{id}/vote
 * @summary Cast an upvote/downvote on a thread by id
 * @tags forum
 * @param {Vote} request.body.required Request body - application/json
 * @return {ForumThread} 200 - OK - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.post("/:id/vote", protect, voteThread)

/**
 * DELETE /api/forum/{id}/vote
 * @summary Remove an upvote/downvote from a thread
 * @tags forum
 * @return {ForumThread} 200 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 404 - Not Found - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.delete("/:id/vote", protect, unvoteThread)

/**
 * DELETE /api/forum/{id}
 * @summary Delete a forum thread by id
 * @tags forum
 * @param {string} id.path Thread id
 * @return {object} 200 - Thread deleted - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 404 - Thread not found for this user - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.delete("/:id", protect, deleteThread)

/**
 * POST /api/forum/{id}/comments
 * @summary Post a comment on a thread
 * @tags forum
 * @param {string} id.path Thread id
 * @param {ForumThreadAnswer} request.body
 * @return {ForumThread} 201 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 404 - Not Found - application/json
 * @return {object} 500 - Internal Server Error - applicatiosn/json
 */
router.post("/:id/comments", protect, createThreadComment)

/**
 * PATCH /api/forum/{id}/comments/{comment}
 * @summary Edit a comment from a thread
 * @tags forum
 * @param {string} id.path.required Thread id
 * @param {string} comment.path.required Comment id
 * @param {ForumThreadAnswer} request.body
 * @return {ForumThreadAnswer} 200 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 404 - Thread or comment not found - application/json
 * @return {object} 500 - Internal Server Error - applicatiosn/json
 */
router.patch("/:id/comments/:comment", protect, editThreadComment)

/**
 * POST /api/forum/{id}/comments/{comment}/vote
 * @summary Cast a vote to a comment from a thread
 * @tags forum
 * @param {string} id.path.required Thread id
 * @param {string} comment.path.required Comment id
 * @param {Vote} request.body.required Vote - application/json
 * @return {ForumThreadAnswer} 200 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 404 - Thread or comment not found - application/json
 * @return {object} 500 - Internal Server Error - applicatiosn/json
 */
router.post("/:id/comments/:comment/vote", protect, voteThreadComment)

/**
 * DELETE /api/forum/{id}/comments/{comment}/vote
 * @summary Remove an upvote/downvote from a thread comment
 * @tags forum
 * @return {ForumThread} 200 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 404 - Not found - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.delete("/:id/comments/:comment/vote", protect, unvoteThreadComment)

/**
 * PATCH /api/forum/{id}/comments/{comment}/mark
 * @summary Mark a thread comment as the correct answer
 * @tags forum
 * @return {ForumThread} 200 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - appllication/json
 * @return {object} 404 - Thread not found for this user - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.patch("/:id/comments/:comment/mark", protect, markThreadComment)

/**
 * DELETE /api/forum/{id}/comments/{comment}/mark
 * @summary Unmark a comment as the correct answer
 * @tags forum
 * @return {ForumThread} 200 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - appllication/json
 * @return {object} 404 - Thread not found for this user - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.delete("/:id/comments/:comment/mark", protect, unmarkThreadComment)

/**
 * DELETE /api/forum/{id}/comments/{comment}
 * @summary Delete a comment from a thread
 * @tags forum
 * @param {string} id.path.required Thread id
 * @param {number} comment.path.required Comment id
 * @return {object} 200 - OK - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 404 - Not found - application/json
 * @return {object} 500 - Internal Server Error - applicatiosn/json
 */
router.delete("/:id/comments/:comment", protect, deleteThreadComment)

module.exports = router
