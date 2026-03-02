const express = require("express")
const router = express.Router()
const { body } = require("express-validator")
const { protect, restrictTo } = require("../app")
const userController = require("../controllers/UserController")

// ── Validation rules ──────────────────────────────────────────────────────────
const updateProfileRules = [
    body("name").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
    body("bio").optional().isLength({ max: 300 }).withMessage("Bio max 300 characters"),
]

const changePasswordRules = [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
        .isLength({ min: 8 }).withMessage("New password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Must contain uppercase, lowercase, and a number"),
]

// ── Student / self routes ──────────────────────────────────────────────────────

/**
 * GET /api/user/profile
 * @summary Get own user profile
 * @tags Users
 * @security BearerAuth
 * @return {object} 200 - User profile data
 * @return {object} 401 - Unauthorized
 */
router.get("/profile", protect, userController.getProfile)

/**
 * PUT /api/user/profile
 * @summary Update own profile (name, bio, avatar)
 * @tags Users
 * @security BearerAuth
 * @param {object} request.body
 * @param {string} request.body.name - Display name
 * @param {string} request.body.bio - Short bio
 * @param {string} request.body.avatar - Avatar URL
 * @return {object} 200 - Updated profile
 * @return {object} 422 - Validation error
 */
router.put("/profile", protect, updateProfileRules, userController.updateProfile)

/**
 * PUT /api/user/change-password
 * @summary Change own password
 * @tags Users
 * @security BearerAuth
 * @param {object} request.body.required
 * @param {string} request.body.currentPassword.required - Current password
 * @param {string} request.body.newPassword.required - New password
 * @return {object} 200 - Password changed
 * @return {object} 401 - Incorrect current password
 */
router.put("/change-password", protect, changePasswordRules, userController.changePassword)

/**
 * DELETE /api/user/profile
 * @summary Deactivate own account
 * @tags Users
 * @security BearerAuth
 * @return {object} 200 - Account deactivated
 */
router.delete("/profile", protect, userController.deleteAccount)

// ── Admin routes ───────────────────────────────────────────────────────────────

/**
 * GET /api/user/stats
 * @summary [Admin] Get user statistics
 * @tags Users
 * @security BearerAuth
 * @return {object} 200 - User counts
 * @return {object} 403 - Forbidden
 */
router.get("/stats", protect, restrictTo("admin"), userController.getUserStats)

/**
 * GET /api/user
 * @summary [Admin] Get all users with pagination, filtering, search
 * @tags Users
 * @security BearerAuth
 * @param {integer} page.query - Page number (default: 1)
 * @param {integer} limit.query - Results per page (default: 10)
 * @param {string} role.query - Filter by role (student | admin)
 * @param {string} search.query - Search by name or email
 * @param {string} isActive.query - Filter by active status (true | false)
 * @return {object} 200 - Paginated user list
 */
router.get("/", protect, restrictTo("admin"), userController.getAllUsers)

/**
 * GET /api/user/{id}
 * @summary [Admin] Get user by ID
 * @tags Users
 * @security BearerAuth
 * @param {string} id.path.required - User ID
 * @return {object} 200 - User data
 * @return {object} 404 - User not found
 */
router.get("/:id", protect, restrictTo("admin"), userController.getUserById)

/**
 * PUT /api/user/{id}
 * @summary [Admin] Update a user (role, isActive, name, bio)
 * @tags Users
 * @security BearerAuth
 * @param {string} id.path.required - User ID
 * @param {object} request.body
 * @param {string} request.body.role - student | admin
 * @param {boolean} request.body.isActive - Active status
 * @return {object} 200 - Updated user
 */
router.put("/:id", protect, restrictTo("admin"), userController.updateUserByAdmin)

/**
 * DELETE /api/user/{id}
 * @summary [Admin] Permanently delete a user
 * @tags Users
 * @security BearerAuth
 * @param {string} id.path.required - User ID
 * @return {object} 200 - User deleted
 */
router.delete("/:id", protect, restrictTo("admin"), userController.deleteUserByAdmin)

module.exports = router