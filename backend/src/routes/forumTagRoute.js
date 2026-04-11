const express = require("express")
const { getTags, createTag, deleteTag, editTag } = require("../controllers/forumTagsController")
const { protect, restrictTo } = require("../app")

const router = express.Router()

/**
 * GET /api/forum/tags
 * @summary Get all forum tags
 * @tags forum
 * @param {String} q.query
 * @return {ForumTag[]} 200 - OK - application/json
 * @return {object} 500 - Internal Server Error - applicatiosn/json
 */
router.get("/", getTags)

/**
 * POST /api/forum/tags
 * @summary Create forum tag
 * @description Create a forum tag. Restricted to admin users.
 * @tags forum
 * @param {ForumTag} request.body
 * @return {ForumTag} 201 - Created - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 403 - Forbidden - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.post("/", protect, restrictTo("admin"), createTag)

/**
 * PUT /api/forum/tags/{name}
 * @summary Edit a forum tag by name
 * @description Edit a forum tag by name. Restricted to admin users.
 * @tags forum
 * @param {string} name.path.required
 * @param {ForumTag} request.body
 * @return {ForumTag} 200 - Updated - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 404 - Tag not found - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.put("/:name", protect, restrictTo("admin"), editTag)

/**
 * DELETE /api/forum/tags/{name}
 * @summary Delete a forum tag by name
 * @description Delete a forum tag by name. Restricted to admin users.
 * @tags forum
 * @param {string} name.path.required
 * @return {ForumTag} 200 - Deleted tag - application/json
 * @return {object} 400 - Bad Request - application/json
 * @return {object} 401 - Unauthorized - application/json
 * @return {object} 403 - Forbidden - application/json
 * @return {object} 404 - Tag not found - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.delete("/:name", protect, restrictTo("admin"), deleteTag)

module.exports = router
