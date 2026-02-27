const express = require("express")
const router = express.Router()

const { submitExam } = require("../controllers/submissionController");
const { getUserProgress } = require("../controllers/progressController");
const { startExam} = require("../controllers/examController");
const { fetchApiQuestions, importSelectedQuestions,} = require("../controllers/AddQuestions");


// Start exam
/*router.post("/start", async (req, res) => {
  const { level } = req.body;
  console.log("Received start request for level:", level);

  // 20 fake questions
  const questions = Array.from({ length: 20 }, (_, i) => ({
    _id: i + 1,
    questionText: `Sample question ${i + 1}? (Level: ${level})`,
    options: ["A", "B", "C", "D"]
  }));

  res.json({ questions }); // <-- must send response
});
*/

// Start exam
router.post("/start", startExam);

// Submit exam
router.post("/submit", submitExam)

// Get progress
router.get("/progress/:userId", getUserProgress);


// ================= QUESTION IMPORT ROUTES (Admin)=================

// Fetch preview questions
router.get("/questions", fetchApiQuestions);

// Import selected questions
router.post("/questions/import", importSelectedQuestions);


module.exports = router;