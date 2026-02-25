require("dotenv").config()

const os = require("os")
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const { StatusCodes } = require("http-status-codes")
const expressJSDocSwagger = require("express-jsdoc-swagger")

const createResponse = require("./lib/createResponse")
const { initGridFS } = require("./config/gridfs")
const swaggerOptions = require("./config/swagger")

// Import routes
const rootRoute = require("./routes/rootRoute")
const usersRoute = require("./routes/usersRoute")
const examLevelRoute = require("./routes/examLevelRoute")
const subjectRoute = require("./routes/subjectRoute")
const contentRoute = require("./routes/contentRoute")
const fileRoute = require("./routes/fileRoute")
const forumRoute = require("./routes/forumRoute")
const forumTagsRoute = require("./routes/forumTagRoute")
const mockExamRoute = require("./routes/mockExamRoute")

const app = express()

// middlewares
app.use(cors())
app.use(express.json({ limit: "4mb" }))

expressJSDocSwagger(app)(swaggerOptions)

// API routes
app.use("/api/user", usersRoute)
app.use("/api/exam-levels", examLevelRoute)
app.use("/api/subjects", subjectRoute)
app.use("/api/contents", contentRoute)
app.use("/api/files", fileRoute)
// please keep the forum tags route above the forum route
app.use("/api/forum/tags", forumTagsRoute)
app.use("/api/forum", forumRoute)
app.use("/api/mock-exams", mockExamRoute)

app.use("/api", rootRoute)

app.use((req, res) => createResponse(res, StatusCodes.NOT_FOUND, "Requested route not found"))

app.use((err, req, res, next) => {
    console.error(err)
    createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error")
})

const start = async () => {
    const { MONGO_URI } = process.env
    const SERVER_PORT = process.env.SERVER_PORT || 8888

    await mongoose.connect(MONGO_URI, { dbName: "ExamCoach" })
    console.log("MongoDB connected")

    // Initialize GridFS after MongoDB connection
    initGridFS()

    app.listen(SERVER_PORT, () => {
        let networkInterfaces = os.networkInterfaces()
        let address = networkInterfaces.wlo1 && networkInterfaces.wlo1[0].address
        console.log("Server listening on")
        console.log(`\tLocal:\thttp://127.0.0.1:${SERVER_PORT}`)
        console.log("Connected to DB:", mongoose.connection.name)
        console.log("ENV URI:", process.env.MONGO_URI)
        address && console.log(`\tIP:\thttp://${address}:${SERVER_PORT}`)
    })
}

start()

module.exports = app
