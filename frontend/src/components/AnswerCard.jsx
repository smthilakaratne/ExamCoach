import { useLocation, useNavigate } from "react-router-dom";

export default function AnswerCard({ question, userAnswer }) {
const location = useLocation();
  const { questions, answers } = location.state || {};
  
  return (
    <div style={{ marginBottom: "25px" }}>
      <h3>{question.question}</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {question.options.map((option, idx) => {
          let bgColor = "white";

          // correct answer
          if (idx === question.correctAnswer) {
            bgColor = "#c8f7c5"; // light green
          }

          // wrong selected answer
          if (
            userAnswer === idx &&
            idx !== question.correctAnswer
          ) {
            bgColor = "#f7c5c5"; // light red
          }

          return (
            <li
              key={idx}
              style={{
                padding: "10px",
                marginBottom: "6px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                backgroundColor: bgColor,
              }}
            >
              {option}
            </li>
          );
        })}
      </ul>

      {question.explanation && (
        <p style={{ fontStyle: "italic", color: "#555" }}>
          Explanation: {question.explanation}
        </p>
      )}
    </div>
  );
}
