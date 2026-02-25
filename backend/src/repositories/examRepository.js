
const Exam = require("../models/Exam");

async function saveOrUpdate(userId, level, score) {
  return await Exam.findOneAndUpdate(
    { userId, level },
    { score, submittedAt: new Date() },
    { upsert: true, new: true }
  );
}

module.exports = { saveOrUpdate };