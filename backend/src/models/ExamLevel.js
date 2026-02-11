const mongoose = require("mongoose")

const examLevelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Exam level name is required"],
            unique: true,
            trim: true,
            // e.g., "Advanced Level", "Ordinary Level"
        },
        code: {
            type: String,
            required: [true, "Exam level code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            // e.g., "AL", "OL"
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt
    }
)

module.exports = mongoose.model("ExamLevel", examLevelSchema)