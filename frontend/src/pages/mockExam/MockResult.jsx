import { useLocation, useNavigate } from "react-router-dom"
import Button from "../../components/Button"

export default function MockResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const fixedUserId = "64f1c5a2f9a0b123456789ab" // fixed userId
  const { level, questions, answers, score } = location.state || {}

  if (!level || score === undefined) {
    return <p>No exam result found.</p>
  }

  return (
    <div>
      <h1>Congratulations!</h1>
      <p>Level: {level}</p>
      <p>Your score: {score}%</p>

      <button
        onClick={() =>
          navigate("/mock-exam/exam-answers", { state: { questions, answers } })
        }
      >
        See Answers
      </button>

      <Button kind="primary" onClick={() => navigate("/mock-exam/mock-levels")}>
        Back to Levels
      </Button>
    </div>
  )
}
