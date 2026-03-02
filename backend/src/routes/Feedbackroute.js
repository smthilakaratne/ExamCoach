const express = require("express")
const router = express.Router()
const { body } = require("express-validator")
const { protect, restrictTo } = require("../app")
const feedbackController = require("../controllers/Feedbackcontroller")

// ── Validation rules ──────────────────────────────────────────────────────────
const feedbackRules = [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 5, max: 150 }),
    body("content").trim().notEmpty().withMessage("Content is required").isLength({ min: 10, max: 2000 }),
    body("category")
        .optional()
        .isIn(["general", "course", "platform", "suggestion", "bug", "other"])
        .withMessage("Invalid category"),
]

const replyRules = [
    body("content").trim().notEmpty().withMessage("Reply cannot be empty").isLength({ min: 2, max: 1000 }),
]

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/feedback/stats
 * @summary [Admin] Get feedback statistics
 * @tags Feedback
 * @security BearerAuth
 * @return {object} 200 - Feedback counts and category breakdown
 */
router.get("/stats", protect, restrictTo("admin"), feedbackController.getFeedbackStats)

/**
 * GET /api/feedback/my
 * @summary Get current user's own feedback (all statuses)
 * @tags Feedback
 * @security BearerAuth
 * @param {integer} page.query - Page number
 * @param {integer} limit.query - Results per page
 * @return {object} 200 - Own feedback list
 */
router.get("/my", protect, feedbackController.getMyFeedback)

/**
 * GET /api/feedback
 * @summary Get feedback list (students=public only; admins=all)
 * @tags Feedback
 * @security BearerAuth
 * @param {integer} page.query - Page number (default: 1)
 * @param {integer} limit.query - Results per page (default: 10)
 * @param {string} category.query - Filter by category
 * @param {string} status.query - [Admin only] Filter by status
 * @param {string} search.query - Search in title and content
 * @param {string} sort.query - Sort field (default: -createdAt)
 * @return {object} 200 - Paginated feedback list
 */
router.get("/", protect, feedbackController.getAllFeedback)

/**
 * POST /api/feedback
 * @summary Create new feedback
 * @tags Feedback
 * @security BearerAuth
 * @param {object} request.body.required
 * @param {string} request.body.title.required - Feedback title
 * @param {string} request.body.content.required - Feedback content
 * @param {string} request.body.category - general|course|platform|suggestion|bug|other
 * @param {boolean} request.body.isPublic - Visible to other students (default: true)
 * @return {object} 201 - Feedback created
 * @return {object} 422 - Validation error
 */
router.post("/", protect, feedbackRules, feedbackController.createFeedback)

/**
 * GET /api/feedback/{id}
 * @summary Get single feedback by ID
 * @tags Feedback
 * @security BearerAuth
 * @param {string} id.path.required - Feedback ID
 * @return {object} 200 - Feedback detail with replies
 * @return {object} 404 - Not found
 */
router.get("/:id", protect, feedbackController.getFeedbackById)

/**
 * PUT /api/feedback/{id}
 * @summary Update feedback (student: edit own pending; admin: change status/note)
 * @tags Feedback
 * @security BearerAuth
 * @param {string} id.path.required - Feedback ID
 * @param {object} request.body
 * @param {string} request.body.title - Updated title (student)
 * @param {string} request.body.content - Updated content (student)
 * @param {string} request.body.category - Updated category (student)
 * @param {boolean} request.body.isPublic - Updated visibility (student)
 * @param {string} request.body.status - pending|reviewed|resolved|rejected (admin)
 * @param {string} request.body.adminNote - Internal admin note (admin)
 * @return {object} 200 - Updated feedback
 */
router.put("/:id", protect, feedbackController.updateFeedback)

/**
 * DELETE /api/feedback/{id}
 * @summary Delete feedback (own feedback or admin)
 * @tags Feedback
 * @security BearerAuth
 * @param {string} id.path.required - Feedback ID
 * @return {object} 200 - Deleted
 */
router.delete("/:id", protect, feedbackController.deleteFeedback)

/**
 * POST /api/feedback/{id}/reply
 * @summary Add a reply to feedback (students and admins)
 * @tags Feedback
 * @security BearerAuth
 * @param {string} id.path.required - Feedback ID
 * @param {object} request.body.required
 * @param {string} request.body.content.required - Reply text
 * @return {object} 201 - Reply added, full feedback returned
 */
router.post("/:id/reply", protect, replyRules, feedbackController.addReply)

/**
 * DELETE /api/feedback/{id}/reply/{replyId}
 * @summary Delete a reply (own reply or admin)
 * @tags Feedback
 * @security BearerAuth
 * @param {string} id.path.required - Feedback ID
 * @param {string} replyId.path.required - Reply ID
 * @return {object} 200 - Reply deleted
 */
router.delete("/:id/reply/:replyId", protect, feedbackController.deleteReply)

/**
 * POST /api/feedback/{id}/react
 * @summary React to feedback (toggles if same type clicked again)
 * @tags Feedback
 * @security BearerAuth
 * @param {string} id.path.required - Feedback ID
 * @param {object} request.body.required
 * @param {string} request.body.type.required - like|helpful|agree|disagree
 * @return {object} 200 - Reaction summary updated
 */
router.post("/:id/react", protect, feedbackController.reactToFeedback)

module.exports = router;