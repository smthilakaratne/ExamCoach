const { validationResult } = require("express-validator")
const { StatusCodes } = require("http-status-codes")

const User = require("../models/User")
const createResponse = require("../lib/createResponse")

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

// ── GET /api/user/profile ─────────────────────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "User not found" })
        }
        return createResponse(res, StatusCodes.OK, { message: "Profile fetched", user })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── PUT /api/user/profile ─────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        if (!handleValidation(req, res)) return

        const { name, bio, avatar } = req.body
        const updates = {}
        if (name !== undefined) updates.name = name
        if (bio !== undefined) updates.bio = bio
        if (avatar !== undefined) updates.avatar = avatar

        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true,
        })
        return createResponse(res, StatusCodes.OK, { message: "Profile updated successfully", user })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── PUT /api/user/change-password ─────────────────────────────────────────────
const changePassword = async (req, res) => {
    try {
        if (!handleValidation(req, res)) return

        const { currentPassword, newPassword } = req.body
        const user = await User.findById(req.user.id).select("+password")

        if (!(await user.comparePassword(currentPassword))) {
            return createResponse(res, StatusCodes.UNAUTHORIZED, {
                message: "Current password is incorrect",
            })
        }

        user.password = newPassword
        await user.save()
        return createResponse(res, StatusCodes.OK, { message: "Password changed successfully" })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── DELETE /api/user/profile ──────────────────────────────────────────────────
const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { isActive: false })
        return createResponse(res, StatusCodes.OK, { message: "Account deactivated successfully" })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ════════════════════════════════════════════════════
//   ADMIN ONLY
// ════════════════════════════════════════════════════

// ── GET /api/user/stats (admin) ───────────────────────────────────────────────
const getUserStats = async (req, res) => {
    try {
        const [total, students, admins, active, verified] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ isEmailVerified: true }),
        ])
        return createResponse(res, StatusCodes.OK, {
            message: "User stats fetched",
            total,
            students,
            admins,
            active,
            verified,
        })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── GET /api/user (admin) ─────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search, isActive } = req.query
        const query = {}

        if (role) query.role = role
        if (isActive !== undefined) query.isActive = isActive === "true"
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ]
        }

        const skip = (Number(page) - 1) * Number(limit)
        const [users, total] = await Promise.all([
            User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            User.countDocuments(query),
        ])

        return createResponse(res, StatusCodes.OK, {
            message: "Users fetched",
            users,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── GET /api/user/:id (admin) ─────────────────────────────────────────────────
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "User not found" })
        }
        return createResponse(res, StatusCodes.OK, { message: "User fetched", user })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── PUT /api/user/:id (admin) ─────────────────────────────────────────────────
const updateUserByAdmin = async (req, res) => {
    try {
        const { name, role, isActive, bio } = req.body
        const updates = {}
        if (name !== undefined) updates.name = name
        if (role !== undefined) updates.role = role
        if (isActive !== undefined) updates.isActive = isActive
        if (bio !== undefined) updates.bio = bio

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        })
        if (!user) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "User not found" })
        }
        return createResponse(res, StatusCodes.OK, { message: "User updated", user })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

// ── DELETE /api/user/:id (admin) ──────────────────────────────────────────────
const deleteUserByAdmin = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return createResponse(res, StatusCodes.NOT_FOUND, { message: "User not found" })
        }
        return createResponse(res, StatusCodes.OK, { message: "User permanently deleted" })
    } catch (err) {
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" })
    }
}

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    getUserStats,
    getAllUsers,
    getUserById,
    updateUserByAdmin,
    deleteUserByAdmin,
}