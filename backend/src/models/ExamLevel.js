const mongoose = require("mongoose");
const Exam = require("./Exam");

const examSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: String, required: true }, // e.g., "Easy", "Intermediate"
    subject: { type: String, required: true, enum: ["Math", "Science", "English", "History", "Geography"] },
    score: { type: Number, required: true },
  },
  { timestamps: true }
);
ExamLevel = mongoose.model("ExamLevel", examSchema);
module.exports = ExamLevel;
