// backend/services/gridfsService.js
const { getGridFsBucket } = require("../config/gridfs")

// Upload a memory-buffer file into GridFSBucket
function uploadBufferToGridFS(file) {
    return new Promise((resolve, reject) => {
        const bucket = getGridFsBucket()

        const uploadStream = bucket.openUploadStream(`${Date.now()}-${file.originalname}`, {
            contentType: file.mimetype,
            metadata: { originalName: file.originalname },
        })

        uploadStream.on("error", reject)

        uploadStream.on("finish", () => {
            const result = {
                _id: uploadStream.id,
                filename: uploadStream.filename,
                contentType: file.mimetype,
                length: file.size,
            }
            console.log("✅ GridFS finished:", result)
            resolve(result)
        })

        uploadStream.end(file.buffer)
    })
}

module.exports = { uploadBufferToGridFS }