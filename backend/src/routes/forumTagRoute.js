const express = require("express")
const { getTags, createTag } = require("../controllers/forumTagsController")
const ForumThread = require("../models/ForumThread")
const router = express.Router()

/**
 * GET /api/forum/tags
 * @summary Get all forum tags
 * @tags forum
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

module.exports = router
