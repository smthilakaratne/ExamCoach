const Question = require("../models/Question");

const importQuestions = async (questions, subjectId) => {
  const savedQuestions = [];

  for (let q of questions) {
    const exists = await Question.findOne({
      questionText: q.questionText,
      subjectId
    });

    if (!exists) {
      const newQuestion = new Question({ ...q, subjectId });
      await newQuestion.save();
      savedQuestions.push(newQuestion);
    }
  }

  return savedQuestions;
};

module.exports = { importQuestions };