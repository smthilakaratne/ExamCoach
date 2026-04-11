
const Question = require("../models/Questions");

async function findByLevel(level) {
  return await Question.find({ level });
}

async function findBySubject(subject) {
  return await Question.find({ subject });
}

module.exports = { findByLevel, findBySubject };