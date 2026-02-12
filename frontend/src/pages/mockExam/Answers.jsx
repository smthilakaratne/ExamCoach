import { useLocation } from "react-router-dom";
import AnswerCard from "../../components/AnswerCard";

export default function ExamReview() {
  const location = useLocation();
  const { questions, answers } = location.state || {};

  if (!questions || !answers) {
    return <p>No exam data found.</p>;
  }

  return (
    <div>
      <h1>Answer Review</h1>

      {questions.map((q) => (
        <AnswerCard
          key={q._id}
          question={q}
          userAnswer={answers[q._id]}
        />
      ))}
    </div>
  );
}
