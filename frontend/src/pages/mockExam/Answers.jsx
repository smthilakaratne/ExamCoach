import { useLocation, useNavigate } from "react-router-dom";

export default function MockAnswers() {
  const location = useLocation();
  const navigate = useNavigate();
  const fixedUserId = "64f1c5a2f9a0b123456789ab"; // fixed userId

  const { questions, answers } = location.state || {};

  if (!questions || !answers) {
    return <p>No answers to display.</p>;
  }

  return (
    <div>
      <h1>Exam Review</h1>

      {questions.map((q, idx) => {
          const qId = q._id.toString();

  const rawUserAnswer = answers[qId];

  const userAnswerIndex =
    rawUserAnswer !== undefined ? Number(rawUserAnswer) : undefined;
        console.log("User Answer Index:", userAnswerIndex);
        console.log("Correct Answer Index:", q.correctAnswer);
  const correctIndex = Number(q.correctAnswer);

  const isCorrectAnswer = userAnswerIndex === correctIndex;
  const isUnanswered = userAnswerIndex === undefined;

  return (
    <div
      key={q._id}
      style={{
        border: "1px solid #ccc",
        padding: 10,
        marginBottom: 10,
        backgroundColor: isUnanswered
          ? "#fff3cd"      // yellow
          : isCorrectAnswer
          ? "#d4edda"      // green
          : "#f8d7da",     // red
      }}
    >
      <h3>
        {idx + 1}. {q.questionText}
      </h3>

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {q.options.map((opt, i) => {
  const isUserChoice = i === userAnswerIndex;
  const isCorrect = i === correctIndex;

  return (
    <li
      key={i}
      style={{
        padding: 5,
        fontWeight: isCorrect ? "bold" : "normal",
        color: isCorrect
          ? "green"
          : isUserChoice
          ? "red"
          : "black",
      }}
    >
      {opt}
      {isUserChoice && " (Your Answer)"}
      {isCorrect && " (Correct Answer)"}
    </li>


          );
        })}
      </ul>
      {!isUnanswered && !isCorrectAnswer && (
  <p style={{ color: "red", fontWeight: "bold" }}>
    Your answer is incorrect.
  </p>
)}

{isCorrectAnswer && (
  <p style={{ color: "green", fontWeight: "bold" }}>
    Your answer is correct.
  </p>
)}
    </div>
  );
})}

      <button onClick={() => navigate("/mock-levels")}>Back to Levels</button>
    </div>
  );
}
