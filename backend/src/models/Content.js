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
            // past_paper, lesson, short_notes, lecture_video
        },
        description: {
            type: String,
            trim: true,
        },

        // Metadata fields
        year: {
            type: Number,
            // e.g., 2023, 2024
        },
        term: {
            type: String,
            enum: ["1st_term", "2nd_term", "3rd_term", "annual", ""],
            default: "",
        },
        unit: {
            type: String,
            trim: true,
            // e.g., "Mechanics", "Electricity", "Thermodynamics"
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],

        // File storage (GridFS or Cloudinary URL)
        // For GridFS: store fileId
        // For Cloudinary: store fileUrl (we'll use this field for both)
        fileId: {
            type: mongoose.Schema.Types.ObjectId,
            // Reference to GridFS file
        },
        fileName: {
            type: String,
        },
        fileType: {
            type: String,
            // e.g., "application/pdf", "image/png"
        },
        fileSize: {
            type: Number,
            // Size in bytes
        },

        // For Past Papers - Answer Sheet
        hasAnswerSheet: {
            type: Boolean,
            default: false,
        },
        answerSheetFileId: {
            type: mongoose.Schema.Types.ObjectId,
            // Reference to GridFS file for answer sheet
        },
        answerSheetFileName: {
            type: String,
        },

        // For Videos - External URL
        videoUrl: {
            type: String,
            trim: true,
            // YouTube, Google Drive, or other video platform URL
        },
        thumbnailUrl: {
            type: String,
            trim: true,
        },

        // Analytics
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
    }
)

// Indexes for faster queries
contentSchema.index({ subject: 1, contentType: 1 })
contentSchema.index({ year: 1, term: 1 })
contentSchema.index({ tags: 1 })

module.exports = mongoose.model("Content", contentSchema)