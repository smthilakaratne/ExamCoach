// backend/routes/contentRoute.js
const express = require("express")
const router = express.Router()

const { upload } = require("../config/gridfs")
const contentController = require("../controllers/contentcontroller")

// CREATE (with file upload)
router.post(
    "/",
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "answerSheet", maxCount: 1 },
    ]),
    contentController.create,
)

// READ all (filters)
router.get("/", contentController.getAll)

// READ one (views++)
router.get("/:id", contentController.getOne)

// UPDATE (optional file replacement)
router.put(
    "/:id",
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "answerSheet", maxCount: 1 },
    ]),
    contentController.update,
)

// DELETE (soft delete)
router.delete("/:id", contentController.remove)

// ANALYTICS - download count
router.post("/:id/download", contentController.download)

module.exports = router