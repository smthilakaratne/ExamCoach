import { useEffect, useState } from "react";
import { submitExam } from "../../services/mockExamApi";
import { useLocation, useNavigate } from "react-router-dom";

function MockResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const { level, answers, questions } = location.state || {};

  const [score, setScore] = useState(null);

  useEffect(() => {
    if (level && answers) {
      submitExam({ level, answers }).then(res => {
        setScore(res.data.score);
      });
    }
  }, [level, answers]);

  return (
    <div>
      <h1>Congratulations</h1>

      {score !== null && <p>Your score is {score}</p>}

      <button
        onClick={() =>
          navigate("/answers", { state: { questions, answers } })
        }
      >
        See Answers
      </button>
    </div>
  );
}

export default MockResult;
