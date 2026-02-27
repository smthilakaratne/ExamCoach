import { useLocation, useNavigate } from "react-router-dom"
import Button from "../../components/Button"

export default function MockResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const fixedUserId = "64f1c5a2f9a0b123456789ab" // fixed userId
  const { level, questions, answers, score } = location.state || {}

  // If no level or score is found in state, show a message
  if (!level || score === undefined) {
    return <p className="text-center mt-10 text-gray-500">No exam result found.</p>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 space-y-6">
      {/*Display result div*/}
      <h1 className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-6 text-center shadow-md w-full max-w-md">Congratulations!</h1>
          <p className="text-lg font-semibold">
            Level: <span className="text-blue-600">{level}</span></p>
          <p className="text-lg font-semibold">
            Your score: <span className="text-green-600">{score}%</span></p>
    
      <div className="flex justify-between w-full max-w-md">
    {/*Button div*/}
      <Button kind="primary" className={"w-1/2 mr-2 flex justify-center bg-blue-600 text-white hover:bg-blue-700 hover:text-white"}
        onClick={() =>
          navigate("/mock-exam/exam-answers", { state: { questions, answers } })
        }
      >
        See Answers
      </Button>
        
      <Button kind="primary" className={"w-1/2 mr-2 flex justify-center bg-blue-600 text-white hover:bg-blue-700 hover:text-white"}
      onClick={() => navigate("/mock-exam/mock-levels")}>
        Back to Levels
      </Button>
      </div>
    </div>
  )
}
