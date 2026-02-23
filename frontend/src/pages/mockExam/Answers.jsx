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
        const userAnswerIndex = answers[q._id];
        const correctIndex = q.correctAnswer;

        return (
          <div
            key={q._id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10,
              backgroundColor:
                userAnswerIndex === correctIndex
                  ? "#d4edda" // green if correct
                  : "#f8d7da", // red if wrong
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
                      color: isUserChoice
                        ? isCorrect
                          ? "green"
                          : "red"
                        : "black",
                    }}
                  >
                    {opt} {isCorrect ? "(Correct)" : ""}
                    {isUserChoice && !isCorrect ? " (Your Choice)" : ""}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <button onClick={() => navigate("/mock-levels")}>Back to Levels</button>
    </div>
  );
}
