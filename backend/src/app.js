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
/*const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, body: { message: "Too many requests. Please try again later." } },
    standardHeaders: true,
    legacyHeaders: false,
})
app.use("/api", apiLimiter)*/

const rootRoute = require("./routes/rootRoute")
const usersRoute = require("./routes/usersRoute")
const authRoute = require("./routes/Authroute")
const feedbackRoute = require("./routes/Feedbackroute")

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
    createResponse(res, StatusCodes.NOT_FOUND, { message: "Requested route not found" }),
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

    return createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Internal server error",
    })
})

const connectDB = async () => {
    if (process.env.NODE_ENV != "test") {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "ExamCoach" })
        console.log(" MongoDB connected")
    }
}

const start = async () => {
    const PORT = process.env.PORT || 8888
    //const { MONGO_URI } = process.env
    // const SERVER_PORT = process.env.SERVER_PORT || 8888
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

if (require.main === module) {
    connectDB().then(start)
}

module.exports = async (req, res) => {
    await connectDB()
    return app(req, res)
}
