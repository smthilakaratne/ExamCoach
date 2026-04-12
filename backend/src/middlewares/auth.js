const { StatusCodes } = require("http-status-codes")
const createResponse = require("../lib/createResponse")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

/**
 * protect – Verifies JWT Bearer token and attaches req.user
 */
const protect = async (req, res, next) => {
    try {
        let token
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1]
        }
        if (!token) {
            return createResponse(res, StatusCodes.UNAUTHORIZED, {
                message: "You are not logged in. Please log in to get access.",
            })
        }

        // Inline require avoids top-level circular dependency with User model
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)

        if (!user) {
            return createResponse(res, StatusCodes.UNAUTHORIZED, {
                message: "The user belonging to this token no longer exists.",
            })
        }
        if (!user.isActive) {
            return createResponse(res, StatusCodes.FORBIDDEN, {
                message: "Your account has been deactivated.",
            })
        }

        req.user = user
        next()
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return createResponse(res, StatusCodes.UNAUTHORIZED, {
                message: "Invalid token. Please log in again.",
            })
        }
        if (err.name === "TokenExpiredError") {
            return createResponse(res, StatusCodes.UNAUTHORIZED, {
                message: "Your token has expired. Please log in again.",
            })
        }
        return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Server error during authentication",
        })
    }
}

/**
 * restrictTo – Role-based access control
 * Usage: router.get("/admin-only", protect, restrictTo("admin"), handler)
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return createResponse(res, StatusCodes.FORBIDDEN, {
                message: `Access denied. This route is restricted to: ${roles.join(", ")}`,
            })
        }
        next()
    }
}

// ── Export BEFORE routes are imported ────────────────────────────────────────
module.exports.protect = protect
module.exports.restrictTo = restrictTo

