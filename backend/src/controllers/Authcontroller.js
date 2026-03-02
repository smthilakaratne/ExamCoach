const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
const { StatusCodes } = require("http-status-codes")

const User = require("../models/User")
const createResponse = require("../lib/createResponse")
const { sendOTPEmail, sendForgotPasswordOTPEmail, sendWelcomeEmail } = require("../lib/email")
const { generateOTP } = require("../lib/tokenUtils")

// ── Helpers ───────────────────────────────────────────────────────────────────

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })

const handleValidation = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        createResponse(res, StatusCodes.UNPROCESSABLE_ENTITY, {
            message: "Validation failed",
            errors: errors.array(),
        })
        return false
    }
    return true
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        if (!handleValidation(req, res)) return

        const { name, email, password } = req.body

        const existing = await User.findOne({ email })
        if (existing) {
            return createResponse(res, StatusCodes.CONFLICT, {
                message: "Email already in use. Please log in or use a different email.",
            })
        }

        const otp = generateOTP()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

        const user = await User.create({
            name,
            email,
            password,
            role: "student",
            emailOTP: otp,
            emailOTPExpiry: otpExpiry,
        })

        await sendOTPEmail(email, otp, name)

        return createResponse(res, StatusCodes.CREATED, {
            message: "Registration successful. Check your email for the OTP.",
            userId: user._id,
            email: user.email,
        })
    } catch (err) {
        console.error("Register error:", err)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Server error during registration",
        })
    }
}

// ── POST /api/auth/admin/create  [Admin only] ─────────────────────────────────
const createAdmin = async (req, res) => {
    try {
        if (!handleValidation(req, res)) return

        const { name, email, password } = req.body

        const existing = await User.findOne({ email })
        if (existing) {
            return createResponse(res, StatusCodes.CONFLICT, {
                message: "An account with this email already exists.",
            })
        }

        const user = await User.create({
            name,
            email,
            password,
            role: "admin",
            isEmailVerified: true,
            isActive: true,
        })

        return createResponse(res, StatusCodes.CREATED, {
            message: `Admin account created successfully for ${name}.`,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        })
    } catch (err) {
        console.error("Create admin error:", err)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Server error while creating admin account",
        })
    }
}

// ── POST /api/auth/verify-email ───────────────────────────────────────────────
const verifyEmail = async (req, res) => {
    try {
        if (!handleValidation(req, res)) return

        const { email, otp } = req.body

        const user = await User.findOne({ email }).select("+emailOTP +emailOTPExpiry")
        if (!user) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "User not found" })
        }
        if (user.isEmailVerified) {
            return createResponse(res, StatusCodes.BAD_REQUEST, { message: "Email is already verified" })
        }
        if (!user.isOTPValid(otp)) {
            return createResponse(res, StatusCodes.BAD_REQUEST, {
                message: "Invalid or expired OTP. Please request a new one.",
            })
        }

        user.isEmailVerified = true
        user.emailOTP = undefined
        user.emailOTPExpiry = undefined
        await user.save({ validateBeforeSave: false })

        await sendWelcomeEmail(email, user.name)

        const token = signToken(user._id)
        return createResponse(res, StatusCodes.OK, {
            message: "Email verified successfully! Welcome to ExamCoach.",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        })
    } catch (err) {
        console.error("Verify email error:", err)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Server error during verification",
        })
    }
}

// ── POST /api/auth/resend-otp ─────────────────────────────────────────────────
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return createResponse(res, StatusCodes.BAD_REQUEST, { message: "Email is required" })
        }

        const user = await User.findOne({ email }).select("+emailOTP +emailOTPExpiry")
        if (!user) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "No account found with that email" })
        }
        if (user.isEmailVerified) {
            return createResponse(res, StatusCodes.BAD_REQUEST, { message: "Email is already verified" })
        }

        const otp = generateOTP()
        user.emailOTP = otp
        user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000)
        await user.save({ validateBeforeSave: false })

        await sendOTPEmail(email, otp, user.name)
        return createResponse(res, StatusCodes.OK, { message: "A new OTP has been sent to your email." })
    } catch (err) {
        console.error("Resend OTP error:", err)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        if (!handleValidation(req, res)) return

        const { email, password } = req.body

        const user = await User.findOne({ email }).select("+password")
        if (!user || !(await user.comparePassword(password))) {
            return createResponse(res, StatusCodes.UNAUTHORIZED, { message: "Invalid email or password" })
        }
        if (!user.isEmailVerified) {
            return createResponse(res, StatusCodes.FORBIDDEN, {
                message: "Please verify your email before logging in.",
            })
        }
        if (!user.isActive) {
            return createResponse(res, StatusCodes.FORBIDDEN, {
                message: "Your account has been deactivated. Contact support.",
            })
        }

        user.lastLogin = Date.now()
        await user.save({ validateBeforeSave: false })

        const token = signToken(user._id)
        return createResponse(res, StatusCodes.OK, {
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        })
    } catch (err) {
        console.error("Login error:", err)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error during login" })
    }
}

// ════════════════════════════════════════════════════════════════════════════
//  FORGOT PASSWORD — 3-step OTP flow
//
//  Step 1:  POST /api/auth/forgot-password         sends OTP to email
//  Step 2:  POST /api/auth/forgot-password/verify  verifies OTP → returns resetToken
//  Step 3:  POST /api/auth/reset-password          uses resetToken + new password
// ════════════════════════════════════════════════════════════════════════════

// ── STEP 1 ────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })

        // Always respond 200 to prevent email enumeration
        if (!user) {
            return createResponse(res, StatusCodes.OK, {
                message: "If that email is registered, an OTP has been sent.",
            })
        }

        const otp = generateOTP()
        user.passwordResetToken = otp                                       // store plain OTP
        user.passwordResetExpiry = new Date(Date.now() + 10 * 60 * 1000)   // expires in 10 min
        await user.save({ validateBeforeSave: false })

        await sendForgotPasswordOTPEmail(email, otp, user.name)

        return createResponse(res, StatusCodes.OK, {
            message: "A 6-digit OTP has been sent to your email.",
        })
    } catch (err) {
        console.error("Forgot password error:", err)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── STEP 2 ────────────────────────────────────────────────────────────────────
const verifyForgotOTP = async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return createResponse(res, StatusCodes.BAD_REQUEST, {
                message: "Email and OTP are required",
            })
        }

        const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpiry")

        if (!user || !user.passwordResetToken) {
            return createResponse(res, StatusCodes.BAD_REQUEST, {
                message: "No password reset was requested for this email",
            })
        }

        if (user.passwordResetToken !== otp) {
            return createResponse(res, StatusCodes.BAD_REQUEST, { message: "Invalid OTP" })
        }

        if (user.passwordResetExpiry < Date.now()) {
            return createResponse(res, StatusCodes.BAD_REQUEST, {
                message: "OTP has expired. Please request a new one.",
            })
        }

        // OTP is valid — issue a short-lived reset token (10 min, password-reset purpose only)
        const resetToken = jwt.sign(
            { id: user._id, purpose: "password-reset" },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        )

        return createResponse(res, StatusCodes.OK, {
            message: "OTP verified. You can now reset your password.",
            resetToken,
        })
    } catch (err) {
        console.error("Verify forgot OTP error:", err)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── STEP 3 ────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        if (!handleValidation(req, res)) return

        const { resetToken, password } = req.body

        if (!resetToken) {
            return createResponse(res, StatusCodes.BAD_REQUEST, { message: "Reset token is required" })
        }

        let decoded
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET)
        } catch {
            return createResponse(res, StatusCodes.BAD_REQUEST, {
                message: "Reset token is invalid or has expired. Please start over.",
            })
        }

        if (decoded.purpose !== "password-reset") {
            return createResponse(res, StatusCodes.BAD_REQUEST, { message: "Invalid reset token" })
        }

        const user = await User.findById(decoded.id).select("+passwordResetToken +passwordResetExpiry")
        if (!user) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "User not found" })
        }

        user.password = password
        user.passwordResetToken = undefined
        user.passwordResetExpiry = undefined
        await user.save()

        return createResponse(res, StatusCodes.OK, {
            message: "Password reset successful. You can now log in with your new password.",
        })
    } catch (err) {
        console.error("Reset password error:", err)
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "User not found" })
        }
        return createResponse(res, StatusCodes.OK, { message: "Current user fetched", user })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
const logout = async (req, res) => {
    return createResponse(res, StatusCodes.OK, {
        message: "Logged out successfully. Please remove your token on the client.",
    })
}

module.exports = {
    register,
    createAdmin,
    verifyEmail,
    resendOTP,
    login,
    forgotPassword,
    verifyForgotOTP,
    resetPassword,
    getMe,
    logout,
}