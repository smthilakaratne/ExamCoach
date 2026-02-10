require("dotenv").config()

const os = require("os")
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const swaggerUi = require("swagger-ui-express")
const swaggerJSDoc = require("swagger-jsdoc")
const { StatusCodes } = require("http-status-codes")

const createResponse = require("./lib/createResponse")

const routes = require("./routes")
const swaggerOptions = require("../config/swagger")

const app = express()

// middlewares
app.use(cors())
app.use(express.json({ limit: "4mb" }))

const swaggerDocs = swaggerJSDoc(swaggerOptions)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// routers
app.use("/api/user", routes.users)

app.use("/", routes.root)

app.use((req, res) => createResponse(res, StatusCodes.NOT_FOUND, "Requested route not found"))

app.use((err, req, res, next) => {
    console.error(err)
    createResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error")
})

const start = async () => {
    const { MONGO_URI } = process.env
    const SERVER_PORT = process.env.SERVER_PORT || 8888
    await mongoose.connect(MONGO_URI)

    app.listen(SERVER_PORT, () => {
        let networkInterfaces = os.networkInterfaces()
        let address = networkInterfaces.wlo1 && networkInterfaces.wlo1[0].address
        console.log("Server listening on")
        console.log(`\tLocal:\thttp://127.0.0.1:${SERVER_PORT}`)
        address && console.log(`\tIP:\thttp://${address}:${SERVER_PORT}`)
    })
}

start()

module.exports = app
