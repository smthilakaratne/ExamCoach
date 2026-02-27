import { useLocation, useNavigate } from "react-router-dom"
import Button from "../../components/Button"

export default function MockAnswers() {
  const location = useLocation()
  const navigate = useNavigate()
  const fixedUserId = "64f1c5a2f9a0b123456789ab" // fixed userId

  const { questions, answers } = location.state || {}

  if (!questions || !answers) {
    return <p className="text-center text-gray-500">No answers to display.</p>
  }

  return (
    <div>
      <h1 className="font-bold text-center">Exam Review</h1>

      {questions.map((q, idx) => {
        const qId = q._id.toString()
        {/*Analyze questions data and set properties*/}
        const rawUserAnswer = answers[qId]

        const userAnswerIndex =
          rawUserAnswer !== undefined ? Number(rawUserAnswer) : undefined
        console.log("User Answer Index:", userAnswerIndex)
        console.log("Correct Answer Index:", q.correctAnswer)
        const correctIndex = Number(q.correctAnswer)

        const isCorrectAnswer = userAnswerIndex === correctIndex
        const isUnanswered = userAnswerIndex === undefined

        return (
          <div
            key={q._id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10,
              backgroundColor: isUnanswered
                ? "#fff3cd" // yellow
                : isCorrectAnswer
                  ? "#d4edda" // green
                  : "#f8d7da", // red
            }}
          > {/*Background colour according to answered and correctness */}
            <h3>
              {idx + 1}. {q.questionText}
            </h3>

            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {q.options.map((opt, i) => {
                const isUserChoice = i === userAnswerIndex
                const isCorrect = i === correctIndex
                  {/*Outer return:Get index of correct answer and user's answer for styling */}
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
                  >{/*Inner return: Logic to display answers and user answers*/}
                    {opt}
                    {isUserChoice && " (Your Answer)"}
                    {isCorrect && " (Correct Answer)"}
                  </li>
                )
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
        )
      })}

      <Button kind="primary" onClick={() => navigate("/mock-exam/exam-summary")}>Back to Levels</Button>
    </div>
  )
}
