const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const { StatusCodes } = require("http-status-codes")
const createResponse = require("../lib/createResponse")

// IMPORT FROM config/gridfs (matches exactly what we created)
const { upload, getGridFsBucket, uploadToGridFS, deleteFromGridFS } = require("../config/gridfs")

/* =====================================================
   UPLOAD SINGLE FILE
   POST /api/files/upload
===================================================== */
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return createResponse(res, StatusCodes.BAD_REQUEST, "No file uploaded")
        }

        console.log("Single file upload:", req.file.originalname)

        const uploadedFile = await uploadToGridFS(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
        )

        return createResponse(res, StatusCodes.OK, uploadedFile)
    } catch (error) {
        console.error("Upload error:", error)
        return createResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "File upload failed: " + error.message,
        )
    }
})

/* =====================================================
   UPLOAD MULTIPLE FILES
   POST /api/files/upload-multiple
===================================================== */
router.post("/upload-multiple", upload.array("files", 2), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return createResponse(res, StatusCodes.BAD_REQUEST, "No files uploaded")
        }

        console.log("Multiple files upload:", req.files.length, "files")

        const uploadPromises = req.files.map((file) =>
            uploadToGridFS(file.buffer, file.originalname, file.mimetype),
        )

        const uploadedFiles = await Promise.all(uploadPromises)

        return createResponse(res, StatusCodes.OK, uploadedFiles)
    } catch (error) {
        console.error("Upload multiple error:", error)
        return createResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Files upload failed: " + error.message,
        )
    }
})

/* =====================================================
   DOWNLOAD FILE
   GET /api/files/download/:fileId
===================================================== */
router.get("/download/:fileId", async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.fileId)
        const gridFsBucket = getGridFsBucket()

        const files = await gridFsBucket.find({ _id: fileId }).toArray()
        if (!files || files.length === 0) {
            return createResponse(res, StatusCodes.NOT_FOUND, "File not found")
        }

        const file = files[0]

        res.set("Content-Type", file.contentType || "application/octet-stream")
        res.set(
            "Content-Disposition",
            `attachment; filename="${file.metadata?.originalName || file.filename}"`,
        )
        res.set("Content-Length", file.length)

        const downloadStream = gridFsBucket.openDownloadStream(fileId)

        downloadStream.on("error", (err) => {
            console.error("Download stream error:", err)
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    statusMessage: "Internal Server Error",
                    body: "File download failed",
                })
            }
        })

        downloadStream.pipe(res)
    } catch (error) {
        console.error("Download error:", error)
        return createResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "File download failed: " + error.message,
        )
    }
})

/* =====================================================
   VIEW / STREAM FILE (INLINE)
   GET /api/files/view/:fileId
===================================================== */
router.get("/view/:fileId", async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.fileId)
        const gridFsBucket = getGridFsBucket()

        const files = await gridFsBucket.find({ _id: fileId }).toArray()
        if (!files || files.length === 0) {
            return createResponse(res, StatusCodes.NOT_FOUND, "File not found")
        }

        const file = files[0]

        res.set("Content-Type", file.contentType || "application/pdf")
        res.set(
            "Content-Disposition",
            `inline; filename="${file.metadata?.originalName || file.filename}"`,
        )
        res.set("Content-Length", file.length)

        const downloadStream = gridFsBucket.openDownloadStream(fileId)

        downloadStream.on("error", (err) => {
            console.error("View stream error:", err)
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    statusMessage: "Internal Server Error",
                    body: "File view failed",
                })
            }
        })

        downloadStream.pipe(res)
    } catch (error) {
        console.error("View error:", error)
        return createResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "File view failed: " + error.message,
        )
    }
})

/* =====================================================
   DELETE FILE
   DELETE /api/files/delete/:fileId
===================================================== */
router.delete("/delete/:fileId", async (req, res) => {
    try {
        await deleteFromGridFS(req.params.fileId)
        return createResponse(res, StatusCodes.OK, {
            message: "File deleted successfully",
        })
    } catch (error) {
        console.error("Delete error:", error)
        return createResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "File deletion failed: " + error.message,
        )
    }
})

/* =====================================================
   FILE METADATA
   GET /api/files/metadata/:fileId
===================================================== */
router.get("/metadata/:fileId", async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.fileId)
        const gridFsBucket = getGridFsBucket()

        const files = await gridFsBucket.find({ _id: fileId }).toArray()
        if (!files || files.length === 0) {
            return createResponse(res, StatusCodes.NOT_FOUND, "File not found")
        }

        return createResponse(res, StatusCodes.OK, files[0])
    } catch (error) {
        console.error("Metadata error:", error)
        return createResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Failed to fetch file metadata: " + error.message,
        )
    }
})

module.exports = router
