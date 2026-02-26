// backend/controllers/submissionController.js
const Exam = require("../models/Exam")
const Question = require("../models/Questions")

async function submitExam(req, res) {
    const { userId, level, answers } = req.body

    if (!userId || !level || !answers) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields",
        })
    }

    try {
        const questions = await Question.find({ level })

        let totalCorrect = 0

        questions.forEach((q) => {
            console.log("User Answer:", answers[q._id])
            console.log("Correct Answer:", q.correctAnswer)
            const qId = q._id.toString() //  convert ObjectId to string

            if (Number(answers[qId]) === Number(q.correctAnswer)) {
                totalCorrect++
            }
        })

        const score = Math.round((totalCorrect / questions.length) * 100)

        const exam = await Exam.findOneAndUpdate(
            { userId, level },
            { score, submittedAt: new Date() },
            { upsert: true, new: true },
        )

        res.json({ success: true, score, questions })
    } catch (err) {
        res.status(500).json({ success: false })
    }
}

module.exports = { submitExam }
