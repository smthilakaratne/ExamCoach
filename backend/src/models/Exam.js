const mongoose = require("mongoose")

/**
 * @typedef Exam
 * @property {string} _id - Exam ID
 * @property {string} userId.required - User ID
 * @property {string} level.required - Exam difficulty level
 * @property {number} score.required - Score achieved
 * @property {string} submittedAt - Submission timestamp
 */

const examSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: false },
    level: { type: String, required: true },
    subject: { type: String, required: true },
    score: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
})

// Ensure one latest record per user per level
examSchema.index({ userId: 1, level: 1, subject: 1 }, { unique: true })

const Exam = mongoose.model("Exam", examSchema)

module.exports = Exam