const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: false },
  level: { type: String, required: true },
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

// Ensure one latest record per user per level
examSchema.index({ userId: 1, level: 1 }, { unique: true });

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
