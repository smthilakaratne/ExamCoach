const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
  level: { type: String, required: true }, // e.g., "easy", "medium", "hard"
  questionText: { type: String, required: true },
  subject: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
});

const Question = mongoose.model("questions", questionSchema)
module.exports = Question
