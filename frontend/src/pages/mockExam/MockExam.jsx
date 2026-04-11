import { useEffect, useState } from "react"
import Question from "../../components/QuestionCard"
import { useLocation, useNavigate } from "react-router-dom"
import { startExam, submitExam } from "../../services/mockExamApi"
import Button from "../../components/button"
import { useAuth } from "../../contexts/AuthContext";

export default function MockExam() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  //const fixedUserId = "64f1c5a2f9a0b123456789ab" // fixed userId
  const { user } = useAuth();
const userId = user?._id;

  const location = useLocation()
  const navigate = useNavigate()
  const level = location.state?.level
  const subject = location.state?.subject
  //var q_id=0;

  /* 
  // MOCK DATA
  useEffect(() => {
    const mockQuestions = [
      {
        _id: "1",
        questionText: "What is 2 + 2?",
        options: ["2", "3", "4", "5"],
        correctAnswer: 2
      },
      {
        _id: "2",
        questionText: "Capital of France?",
        options: ["London", "Berlin", "Paris", "Rome"],
        correctAnswer: 2
      }
    ];

    setQuestions(mockQuestions);
  }, [level]);

  const selectAnswer = (qId, index) => {
    setAnswers({ ...answers, [qId]: index });
  };

  const handleSubmit = () => {
    let totalCorrect = 0;

    questions.forEach(q => {
      if (answers[q._id] === q.correctAnswer) {
        totalCorrect++;
      }
    });

    alert(`You scored ${totalCorrect} / ${questions.length}`);
  };
*/

  // Fetch questions for selected level
 useEffect(() => {
  if (level && subject && user?._id) {
    startExam(level, subject, user._id)
      .then((res) => {
        setQuestions(res.questions)
        setLoading(false)
      })
      .catch((err) => {
        console.error("API ERROR:", err)
        setLoading(false)
      })
  }
}, [level, subject, user])

  const selectAnswer = (qId, index) => {
    setAnswers({ ...answers, [qId]: index })
  }

  const handleSubmit = async () => {
    try {
      console.log("SUBMIT PAYLOAD:", {
  userId,
  level,
  subject,
  answers,
})
if (!user?._id) {
    alert("User not loaded yet")
    return
  }
      const res = await submitExam({
        userId: userId,
        level,
        subject,
        answers,
      }) // backend calculates score
      const score = res.score // backend returns score in percentage

      // Navigate to result page with score and answers
      navigate("/mock-exam/exam-result", {
        state: {
          userId,
          level,
          subject,
          questions: res.questions,
          answers,
          score,
        },
      })
    } catch (err) {
      console.error(err)
      alert("Error submitting exam")
    }
  }

  if (!level) return <p className="text-center text-gray-500">No level selected</p>
  if (loading) return <p className="text-center text-gray-500">Loading questions...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-center my-6 relative">{level} Exam</h1>
      {/*Each question displayed in question card*/}
      {questions.map((q, index) => (
        <div key={q._id + index}>
          <h3 className={`text-lg font-semibold`}>Question {index + 1}</h3>
          <Question
            key={q._id}
            question={q}
            selectedAnswer={answers[q._id]}
            onSelect={selectAnswer}
          />
        </div>
      ))}

      <Button kind="danger" onClick={handleSubmit}>Submit Exam</Button>
      < br />
      <br />
      < br />
      <br />
    </div>
  )
}
