
const Question = require("../models/Questions");

async function findByLevel(level) {
  return await Question.find({ level });
}

module.exports = { findByLevel };