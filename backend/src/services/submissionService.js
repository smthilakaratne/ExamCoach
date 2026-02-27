// backend/services/submissionService.js

const questionRepository = require("../repositories/questionRepository");
const examRepository = require("../repositories/examRepository");
const calculateScore = require("../utils/scoreCalculator");

async function submit(data) {
  const { userId, level, answers } = data;

  if (!userId || !level || !answers) {
    const error = new Error("Missing required fields");
    error.status = 400;
    throw error;
  }

  const questions = await questionRepository.findByLevel(level);

  const score = calculateScore(questions, answers);

  await examRepository.saveOrUpdate(userId, level, score);

  return { score, questions };
}

module.exports = { submit };