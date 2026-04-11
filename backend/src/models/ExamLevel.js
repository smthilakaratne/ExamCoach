const mongoose = require("mongoose")
/**
 * @typedef ExamLevel
 * @property {string} _id - Exam Level ID
 * @property {string} name.required - Exam level name
 * @property {string} code.required - Unique exam level code
 * @property {string} description - Description of the exam level
 * @property {boolean} isActive - Whether the exam level is active
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last updated timestamp
 */

const examLevelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("ExamLevel", examLevelSchema)