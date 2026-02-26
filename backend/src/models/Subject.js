const mongoose = require("mongoose")

const subjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Subject name is required"],
            trim: true,
            // e.g., "Physics", "Chemistry", "Combined Mathematics"
        },
        code: {
            type: String,
            required: [true, "Subject code is required"],
            uppercase: true,
            trim: true,
            // e.g., "PHY", "CHEM", "C_MATH"
        },
        examLevel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExamLevel",
            required: [true, "Exam level is required"],
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
        timestamps: true,
    },
)

// Compound index to ensure unique subject per exam level
subjectSchema.index({ name: 1, examLevel: 1 }, { unique: true })

module.exports = mongoose.model("Subject", subjectSchema)
