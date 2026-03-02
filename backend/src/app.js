require("dotenv").config()

const os = require("os")
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const jwt = require("jsonwebtoken")
const { StatusCodes } = require("http-status-codes")
const expressJSDocSwagger = require("express-jsdoc-swagger")

const createResponse = require("./lib/createResponse")
const { initGridFS } = require("./config/gridfs")
const swaggerOptions = require("./config/swagger")

const app = express()

// ── Core middleware ─────────────────────────────────────────────────────
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: "4mb" }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV === "development") app.use(morgan("dev"))

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, body: { message: "Too many requests. Please try again later." } },
    standardHeaders: true,
    legacyHeaders: false,
})
app.use("/api", apiLimiter)

// ═════════════════════════════════════════════════════════════════════════════
//  AUTH MIDDLEWARE
//  IMPORTANT: defined and exported BEFORE routes are imported below.
//  Routes use: const { protect, restrictTo } = require("../app")
//  Node.js module cache ensures routes get the correct functions as long as
//  module.exports.protect is set before the route require() calls.
// ═════════════════════════════════════════════════════════════════════════════

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
        const User = require("./models/User")
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

// ═════════════════════════════════════════════════════════════════════════════
//  ROUTES  — imported AFTER exports are set above
// ═════════════════════════════════════════════════════════════════════════════
const rootRoute = require("./routes/rootRoute")
const usersRoute = require("./routes/usersRoute")
const authRoute = require("./routes/Authroute")
const feedbackRoute = require("./routes/Feedbackroute")

// Existing routes – uncomment as teammates complete them
const examLevelRoute = require("./routes/examLevelRoute")
 const subjectRoute = require("./routes/subjectRoute")
 const contentRoute = require("./routes/contentRoute")
 const fileRoute = require("./routes/fileRoute")
 const forumRoute = require("./routes/forumRoute")
 const forumTagsRoute = require("./routes/forumTagRoute")
 const mockExamRoute = require("./routes/mockExamRoute")

// ── Swagger ───────────────────────────────────────────────────────────────────
expressJSDocSwagger(app)(swaggerOptions)

// ── Mount routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoute)
app.use("/api/feedback", feedbackRoute)
app.use("/api/user", usersRoute)

 app.use("/api/exam-levels", examLevelRoute)
 app.use("/api/subjects", subjectRoute)
 app.use("/api/contents", contentRoute)
 app.use("/api/files", fileRoute)
 app.use("/api/forum/tags", forumTagsRoute)
 app.use("/api/forum", forumRoute)
 app.use("/api/mock-exams", mockExamRoute)

app.use("/api", rootRoute)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
    createResponse(res, StatusCodes.NOT_FOUND, { message: "Requested route not found" })
)

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(" Unhandled error:", err)

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return createResponse(res, StatusCodes.CONFLICT, { message: `${field} already exists` })
    }
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message)
        return createResponse(res, StatusCodes.UNPROCESSABLE_ENTITY, {
            message: "Validation failed",
            errors: messages,
        })
    }
    if (err.name === "CastError") {
        return createResponse(res, StatusCodes.BAD_REQUEST, {
            message: `Invalid ${err.path}: ${err.value}`,
        })
    }

    return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { message: "Internal server error" })
})

// ── Start server ──────────────────────────────────────────────────────────────
const start = async () => {
    const PORT = process.env.PORT || 8888
    //const { MONGO_URI } = process.env
   // const SERVER_PORT = process.env.SERVER_PORT || 8888

    await mongoose.connect(process.env.MONGO_URI, { dbName: "ExamCoach" })
    console.log(" MongoDB connected")

    initGridFS()

    app.listen(PORT, () => {
        let networkInterfaces = os.networkInterfaces()
        let address = networkInterfaces.wlo1 && networkInterfaces.wlo1[0].address
        console.log("Server listening on")
        console.log(`\tLocal:\thttp://127.0.0.1:${PORT}`)
        console.log("Connected to DB:", mongoose.connection.name)
        console.log("ENV URI:", process.env.MONGO_URI)
        address && console.log(`\tIP:\thttp://${address}:${PORT}`)
    })
}
start()

module.exports = app