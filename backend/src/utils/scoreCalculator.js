
function calculateScore(questions, answers) {
  let totalCorrect = 0;

  questions.forEach(q => {
    const qId = q._id.toString();

    if (Number(answers[qId]) === Number(q.correctAnswer)) {
      totalCorrect++;
    }
  });

  return Math.round((totalCorrect / questions.length) * 100);
}

module.exports = calculateScore;