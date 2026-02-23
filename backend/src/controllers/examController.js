const Exam = require("../models/Exam");
const Question = require("../models/Questions");

async function startExam(req, res) {
  try {
    const { level } = req.body;

    if (!level) {
      return res.status(400).json({ message: "Level is required" });
    }

    const questions = await Question.aggregate([
      { $match: { level } },
      { $sample: { size: 20 } },
      {
        $project: {
          _id:1,
          questionText: 1,
          options: 1
          // do NOT send correctAnswer
        }
      }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        message: "No questions found for this level"
      });
    }

    res.status(200).json({ questions });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { startExam};


/* Example answer key for scoring
const answerKey = {
  1: "A",
  2: "C",
  3: "B",
  4: "D",
  5: "B",
};

const ExamController = async (req, res) => {
  try {
    const { userId, level, answers } = req.body;

    // 1. Calculate score
    let score = 0;
    answers.forEach((answer, index) => {
      const questionNumber = index + 1;
      if (answer === answerKey[questionNumber]) {
        score += 1; // 1 point per correct answer
      }
    });

    // 2. Save to database
    const exam = new Exam({
      userId,
      level,
      answers,
      score,
    });

    await exam.save();

    // 3. Send response back
    res.status(200).json({
      success: true,
      message: "Exam submitted successfully",
      score,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};*/
