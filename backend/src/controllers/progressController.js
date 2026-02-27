const mongoose = require("mongoose")
const ExamLevel = require("../models/ExamLevel")
const Exam = require("../models/Exam")

async function getUserProgress(req, res) {
    try {
        const userId = req.params.userId
        const subject = req.query.subject || "Math" || "math"

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId",
            })
        }

        const objectUserId = new mongoose.Types.ObjectId(userId)

        // Always prepare default structure
        const progress = {
            easy: { attempted: false, bestScore: 0 },
            intermediate: { attempted: false, bestScore: 0 },
            advanced: { attempted: false, bestScore: 0 },
        }

        // Fetch user exams (may be empty — that's OK)
        const exams = await Exam.find({
            userId: objectUserId,
            subject,
        })

        exams.forEach((exam) => {
            const levelKey = exam.level.toLowerCase()
            progress[levelKey] = {
                attempted: true,
                bestScore: exam.score,
            }
        })

        res.json({
            success: true,
            data: progress,
        })
    } catch (err) {
        console.error("Progress Error:", err)
        res.status(500).json({
            success: false,
            message: "Error fetching progress",
        })
    }
}

module.exports = { getUserProgress }
