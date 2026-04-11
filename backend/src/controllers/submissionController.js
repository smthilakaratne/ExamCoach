// backend/controllers/submissionController.js

const Exam = require("../models/Exam")
const Question = require("../models/Questions")
const mongoose = require("mongoose")

async function submitExam(req, res) {
    const { userId, level, subject, answers } = req.body

    console.log("submitExam called with:", req.body)

    try {
        // 1. Validate required fields
        if (!userId || !level || !subject || !answers) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            })
        }

        // 2. Validate ObjectId safely
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId",
            })
        }

        // 3. Fetch questions
        const questions = await Question.find({ level, subject })

        console.log("Fetched questions:", questions.length)

        // 4. Prevent crash if no questions
        if (!questions || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No questions found for this exam",
            })
        }

        // 5. Calculate score
        let totalCorrect = 0

        for (const q of questions) {
            const qId = q._id.toString()
            const userAnswer = answers[qId]

            console.log("Q:", qId, "User:", userAnswer, "Correct:", q.correctAnswer)

            if (Number(userAnswer) === Number(q.correctAnswer)) {
                totalCorrect++
            }
        }

        const score = Math.round((totalCorrect / questions.length) * 100)

        // 6. Save exam safely
        const exam = await Exam.findOneAndUpdate(
            {
                userId: new mongoose.Types.ObjectId(userId),
                subject,
                level,
            },
            {
                score,
                submittedAt: new Date(),
            },
            {
                upsert: true,
                new: true,
            }
        )

        // 7. Response
        return res.json({
            success: true,
            score,
            questions,
            exam,
        })

    } catch (err) {
        console.error("SUBMIT EXAM ERROR:", err)

        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

module.exports = { submitExam }