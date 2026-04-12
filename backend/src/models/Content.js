const mongoose = require("mongoose")

const contentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Content title is required"],
            trim: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: [true, "Subject is required"],
        },
        contentType: {
            type: String,
            required: [true, "Content type is required"],
            enum: ["past_paper", "lesson", "short_notes", "lecture_video"],
        },
        description: {
            type: String,
            trim: true,
        },

        // Metadata fields
        year: {
            type: Number,
        },
        term: {
            type: String,
            enum: ["1st_term", "2nd_term", "3rd_term", "annual", ""],
            default: "",
        },
        unit: {
            type: String,
            trim: true,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],

        // ─── File Storage ────────────────────────────────────────────────────
        // Tracks WHERE the file lives so the app knows how to serve it.
        fileStorage: {
            type: String,
            enum: ["gridfs", "cloudinary", ""],
            default: "",
            // "gridfs"    → use fileId to stream from GridFS
            // "cloudinary" → use fileUrl to redirect/proxy to Cloudinary
        },

        // GridFS fields (used when fileStorage === "gridfs")
        fileId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        // Shared fields (populated regardless of storage backend)
        fileName: {
            type: String,
        },
        fileType: {
            type: String,
        },
        fileSize: {
            type: Number,
        },

        // Cloudinary fields (used when fileStorage === "cloudinary")
        fileUrl: {
            type: String,
            trim: true,
            // Cloudinary secure_url
        },
        cloudinaryPublicId: {
            type: String,
            trim: true,
            // Needed for deletion / transformation
        },

        // ─── Answer Sheet ─────────────────────────────────────────────────────
        hasAnswerSheet: {
            type: Boolean,
            default: false,
        },

        // GridFS answer sheet
        answerSheetFileId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        answerSheetFileName: {
            type: String,
        },

        // Cloudinary answer sheet
        answerSheetFileUrl: {
            type: String,
            trim: true,
        },
        answerSheetCloudinaryPublicId: {
            type: String,
            trim: true,
        },

        // ─── Videos ───────────────────────────────────────────────────────────
        videoUrl: {
            type: String,
            trim: true,
            // YouTube, Google Drive, or other external video platform URL
        },
        thumbnailUrl: {
            type: String,
            trim: true,
        },

        // ─── Analytics ────────────────────────────────────────────────────────
        views: {
            type: Number,
            default: 0,
        },
        downloads: {
            type: Number,
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
)

// Indexes for faster queries
contentSchema.index({ subject: 1, contentType: 1 })
contentSchema.index({ year: 1, term: 1 })
contentSchema.index({ tags: 1 })

module.exports = mongoose.model("Content", contentSchema)