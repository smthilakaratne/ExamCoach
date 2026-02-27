const express = require("express")
const { getTags, createTag, deleteTag } = require("../controllers/forumTagsController")
const ForumThread = require("../models/ForumThread")
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
 * @tags forum
 * @param {ForumTag} request.body
 * @return {ForumTag} 201 - Created - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.post("/", createTag)

/**
 * DELETE /api/forum/tags/{name}
 * @summary Delete a forum tag by name
 * @tags forum
 * @param {string} name.path.required
 * @return {ForumTag} 200 - Deleted tag - application/json
 * @return {object} 404 - Tag not found - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
router.delete("/:name", deleteTag)

module.exports = router
