// backend/src/config/gridfs.js
const mongoose = require("mongoose")
const multer = require("multer")

let gridFsBucket = null

// Call this AFTER mongoose connects
const initGridFS = () => {
    const conn = mongoose.connection

    //  If already connected, init immediately (no race)
    if (conn.readyState === 1) {
        gridFsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: "uploads",
        })
        console.log("✅ GridFSBucket initialized (bucketName: uploads)")
        return
    }

    //  Otherwise wait for open
    conn.once("open", () => {
        gridFsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: "uploads",
        })
        console.log("✅ GridFSBucket initialized (bucketName: uploads)")
    })
}

const getGridFsBucket = () => {
    if (!gridFsBucket) {
        throw new Error("GridFSBucket not initialized. Call initGridFS() after MongoDB connection.")
    }
    return gridFsBucket
}

// Multer memory storage -> gives req.file.buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "application/x-pdf",
            "application/octet-stream",
            "image/jpeg",
            "image/png",
            "image/jpg",
        ]
        if (allowedTypes.includes(file.mimetype)) cb(null, true)
        else cb(new Error("Invalid file type. Only PDF and images are allowed."))
    },
})

// Upload helper
const uploadToGridFS = (buffer, originalName, mimetype) => {
    return new Promise((resolve, reject) => {
        const bucket = getGridFsBucket()
        const filename = `${Date.now()}-${originalName}`

        const uploadStream = bucket.openUploadStream(filename, {
            contentType: mimetype,
            metadata: { originalName, uploadedAt: new Date() },
        })

        uploadStream.on("error", reject)
        uploadStream.on("finish", (fileDoc) => resolve(fileDoc))

        uploadStream.end(buffer)
    })
}

// Delete helper
const deleteFromGridFS = async (fileId) => {
    const bucket = getGridFsBucket()
    const _id = new mongoose.Types.ObjectId(fileId)
    await bucket.delete(_id)
    return true
}

module.exports = {
    initGridFS,
    upload,
    getGridFsBucket,
    uploadToGridFS,
    deleteFromGridFS,
}
