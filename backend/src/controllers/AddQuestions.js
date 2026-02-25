const axios = require("axios");
const Question = require("../models/Question");

// Fetch preview questions (NOT SAVED)
const fetchApiQuestions = async (req, res) => {
  try {
    const { level } = req.query;

    const difficultyMap = {
      easy: "easy",
      intermediate: "medium",
      advanced: "hard",
    };

    const difficulty = difficultyMap[level];

    const response = await axios.get(
      `https://opentdb.com/api.php?amount=5&difficulty=${difficulty}&type=multiple`
    );

    const formatted = response.data.results.map((q) => {
      const options = [...q.incorrect_answers, q.correct_answer]; //combine correct + incorrect answers
      options.sort(() => Math.random() - 0.5); //randomize options

      return {
        questionText: decodeHTML(q.question),
        options: options.map(decodeHTML),
        correctAnswer: decodeHTML(q.correct_answer),
        level,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

// Import selected questions (SAVE TO DB)
const importSelectedQuestions = async (req, res) => {
  try {
    const { questions, subjectId } = req.body;

    const savedQuestions = [];

    for (let q of questions) {
      // Duplicate prevention
      const exists = await Question.findOne({
        questionText: q.questionText,
      });

      if (!exists) {
        const newQuestion = new Question({
          ...q,
          subjectId,
        });

        await newQuestion.save();
        savedQuestions.push(newQuestion);
      }
    }

    res.status(200).json({
      message: "Questions imported successfully",
      importedCount: savedQuestions.length,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Import failed" });
  }
};

// Decode HTML entities
function decodeHTML(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

module.exports = {
  fetchApiQuestions,
  importSelectedQuestions,
};