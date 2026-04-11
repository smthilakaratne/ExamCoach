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
/**
 * POST /api/mock-exams/start
 * @summary Start a mock exam
 * @tags mock-exams
 * @param {object} request.body.required - Start exam payload
 * @property {string} request.body.level.required - Exam difficulty level
 * @property {string} request.body.subject - Subject name
 * @return {object} 200 - Exam questions - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
// Start exam
router.post("/start", startExam);

/**
 * POST /api/mock-exams/submit
 * @summary Submit completed mock exam
 * @tags mock-exams
 * @param {object} request.body.required - Submission payload
 * @property {string} request.body.userId.required - User ID
 * @property {string} request.body.level.required - Exam level
 * @property {number} request.body.score.required - Score achieved
 * @property {string} request.body.subject - Subject
 * @return {object} 200 - Submission result - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
// Submit exam
router.post("/submit", submitExam)

/**
 * GET /api/mock-exams/progress/{userId}
 * @summary Get user progress by exam level
 * @tags mock-exams
 * @param {string} userId.path.required - User ID
 * @param {string} subject.query - Subject name
 * @return {object} 200 - Progress data - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
// Get progress
router.get("/progress/:userId", getUserProgress);


// ================= QUESTION IMPORT ROUTES (Admin)=================

/**
 * POST /api/mock-exams/questions/import
 * @summary Import selected questions into database
 * @tags mock-exams
 * @param {array<object>} request.body.required - Questions array
 * @return {object} 200 - Import success - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
// Fetch preview questions
router.get("/questions", fetchApiQuestions);

// Import selected questions
router.post("/questions/import", importSelectedQuestions);


module.exports = router;