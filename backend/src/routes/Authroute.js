const express = require("express")
const router = express.Router()
const { body } = require("express-validator")
const rateLimit = require("express-rate-limit")
const { protect, restrictTo } = require("../middlewares/auth")
const authController = require("../controllers/Authcontroller")

// ── Rate limiters ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many attempts. Try again in 15 minutes." },
})

// ── Validation rules ──────────────────────────────────────────────────────────
const registerRules = [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase, and a number"),
]

const loginRules = [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
]

const newPasswordRules = [
    body("password")
        .isLength({ min: 8 }).withMessage("Min 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Must contain uppercase, lowercase and a number"),
    body("confirmPassword").custom((v, { req }) => {
        if (v !== req.body.password) throw new Error("Passwords do not match")
        return true
    }),
]

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * @summary Register a new student account (role is always "student")
 * @tags Auth
 * @param {object} request.body.required
 * @param {string} request.body.name.required - Full name
 * @param {string} request.body.email.required - Email address
 * @param {string} request.body.password.required - Min 8 chars, upper+lower+digit
 * @return {object} 201 - Registration successful, OTP sent to email
 * @return {object} 409 - Email already in use
 */
router.post("/register", authLimiter, registerRules, authController.register)

/**
 * POST /api/auth/admin/create
 * @summary [Admin only] Create a new admin account (pre-verified, no OTP required)
 * @tags Auth
 * @security BearerAuth
 * @param {object} request.body.required
 * @param {string} request.body.name.required - Full name
 * @param {string} request.body.email.required - Email address
 * @param {string} request.body.password.required - Min 8 chars, upper+lower+digit
 * @return {object} 201 - Admin account created
 * @return {object} 403 - Forbidden (not an admin)
 */
router.post("/admin/create", protect, restrictTo("admin"), registerRules, authController.createAdmin)

/**
 * POST /api/auth/verify-email
 * @summary Verify email address using 6-digit OTP sent on registration
 * @tags Auth
 * @param {object} request.body.required
 * @param {string} request.body.email.required - Email address
 * @param {string} request.body.otp.required - 6-digit OTP
 * @return {object} 200 - Email verified, JWT token returned
 * @return {object} 400 - Invalid or expired OTP
 */
router.post(
    "/verify-email",
    [
        body("email").isEmail().withMessage("Valid email required"),
        body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits"),
    ],
    authController.verifyEmail
)

/**
 * POST /api/auth/resend-otp
 * @summary Resend the email verification OTP
 * @tags Auth
 * @param {object} request.body.required
 * @param {string} request.body.email.required - Registered email
 * @return {object} 200 - New OTP sent
 */
router.post("/resend-otp", authController.resendOTP)

/**
 * POST /api/auth/login
 * @summary Login — response includes role for dashboard routing
 * @tags Auth
 * @param {object} request.body.required
 * @param {string} request.body.email.required - Email
 * @param {string} request.body.password.required - Password
 * @return {object} 200 - body.user.role is "student" or "admin"
 * @return {object} 401 - Invalid credentials
 * @return {object} 403 - Email not verified or account deactivated
 */
router.post("/login", authLimiter, loginRules, authController.login)

/**
 * POST /api/auth/forgot-password
 * @summary Step 1 — Send a 6-digit OTP to the user's email
 * @tags Auth - Forgot Password
 * @param {object} request.body.required
 * @param {string} request.body.email.required - Registered email
 * @return {object} 200 - OTP sent (always 200 to prevent email enumeration)
 */
router.post(
    "/forgot-password",
    authLimiter,
    [body("email").isEmail().withMessage("Valid email required")],
    authController.forgotPassword
)

/**
 * POST /api/auth/forgot-password/verify
 * @summary Step 2 — Verify the OTP. Returns a resetToken to use in step 3.
 * @tags Auth - Forgot Password
 * @param {object} request.body.required
 * @param {string} request.body.email.required - Registered email
 * @param {string} request.body.otp.required - 6-digit OTP from email
 * @return {object} 200 - OTP valid, resetToken returned
 * @return {object} 400 - Invalid or expired OTP
 */
router.post(
    "/forgot-password/verify",
    [
        body("email").isEmail().withMessage("Valid email required"),
        body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits"),
    ],
    authController.verifyForgotOTP
)

/**
 * POST /api/auth/reset-password
 * @summary Step 3 — Set a new password using the resetToken from step 2
 * @tags Auth - Forgot Password
 * @param {object} request.body.required
 * @param {string} request.body.resetToken.required - Token returned from step 2
 * @param {string} request.body.password.required - New password
 * @param {string} request.body.confirmPassword.required - Must match password
 * @return {object} 200 - Password reset successful
 * @return {object} 400 - Invalid or expired reset token
 */
router.post("/reset-password", newPasswordRules, authController.resetPassword)

/**
 * GET /api/auth/me
 * @summary Get the currently logged-in user
 * @tags Auth
 * @security BearerAuth
 * @return {object} 200 - Current user data
 */
router.get("/me", protect, authController.getMe)

/**
 * POST /api/auth/logout
 * @summary Logout (client must delete the token)
 * @tags Auth
 * @security BearerAuth
 * @return {object} 200 - Logout message
 */
router.post("/logout", protect, authController.logout)

module.exports = router