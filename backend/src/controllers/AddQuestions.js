const axios = require("axios");
const Question = require("../models/Questions");
//const Subject = require("../models/Subject");

// STEP 1 - Fetch Preview
const fetchApiQuestions = async (req, res) => {
  try {
    const { level,subject } = req.query;

    const difficultyMap = {
      easy: "easy",
      intermediate: "medium",
      advanced: "hard",
    };

    const categoryMap = {
  math: 19,
  science: 17,
  history: 23,
};
//subjects
/*const subjectDoc = await Subject.findOne({
      name: new RegExp(`^${subject}$`, "i"),
      isActive: true,
    })

    if (!subjectDoc) {
      return res.status(404).json({ message: "Subject not found" })
    }*/

    //const category = subjectDoc.opentdbCategory

const normalizedSubject = subject.toLowerCase(); // ensure lowercase
const category = categoryMap[normalizedSubject];

if (!category) {
  return res.status(400).json({ message: "Invalid subject" });
}

    const difficulty = difficultyMap[level];

    const response = await axios.get(
      `https://opentdb.com/api.php?amount=5&difficulty=${difficulty}&category=${category}&type=multiple`
    );

    const formatted = response.data.results.map((q) => {
      const options = [...q.incorrect_answers, q.correct_answer];
      options.sort(() => Math.random() - 0.5);

      return {
        questionText: decodeHTML(q.question),
        options: options.map(decodeHTML),
        correctAnswer: decodeHTML(q.correct_answer),
        level,
        subject,
        //subject: subjectDoc.name,
      };
    });

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};


// STEP 3 - Import Selected
const importSelectedQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    console.log("Received questions:", questions); // log incoming payload

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "No questions provided" });
    }

    const savedQuestions = [];

    for (let q of questions) {
      console.log("Processing question:", q); //  log each question
      const exists = await Question.findOne({
        questionText: q.questionText,
        subject: q.subject,
      });

      if (!exists) {
        const newQuestion = new Question({ ...q });
        console.log("Saving new question:", newQuestion);
        await newQuestion.save();
        savedQuestions.push(newQuestion);
      }
    }

    res.status(200).json({
      message: "Questions imported successfully",
      importedCount: savedQuestions.length,
    });
  } catch (error) {
    console.error("Import error:", error); // log full error
    res.status(500).json({ message: "Import failed", error: error.message });
  }
};

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