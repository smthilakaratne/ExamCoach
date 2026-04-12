const mongoose = require("mongoose")
const os = require("os")
const app = require("./app")
const { initGridFS } = require("./config/gridfs")

// ── Start server ──────────────────────────────────────────────────────────────
const start = async () => {
    const PORT = process.env.PORT || 8888
    //const { MONGO_URI } = process.env
   // const SERVER_PORT = process.env.SERVER_PORT || 8888
    if (process.env.NODE_ENV != "test") {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "ExamCoach" })
        console.log(" MongoDB connected")
    }

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