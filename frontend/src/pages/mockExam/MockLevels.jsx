import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getProgress } from "../../services/mockExamApi"
import Level from "../../components/LevelCard"
import axios from "axios"

export default function MockLevels() {
  const [subjects, setSubjects] = useState([])
  const navigate = useNavigate()
   const [subject, setSubject] = useState("")
  //const fixedUserId = "64f1c5a2f9a0b123456789ab"
  const user = getCurrentUser()
  const userId = user.id
  const [progress, setProgress] = useState({
    easy: { attempted: false, bestScore: 0 },
    intermediate: { attempted: false, bestScore: 0 },
    advanced: { attempted: false, bestScore: 0 },
  })
  useEffect(() => {
  axios.get("http://localhost:8888/api/subjects/").then((res) => {
    const subjectList = res.data?.body || []
 console.log("FULL RESPONSE:", res.data)
    setSubjects(Array.isArray(subjectList) ? subjectList : [])
    console.log("Fetched subjects:", subjectList )
    if (Array.isArray(subjectList) && subjectList.length > 0) {
      setSubject(subjectList[0].name)
    }
  }).catch((err) => {
    console.error("Failed to fetch subjects:", err)
    setSubjects([])
  })
}, [])

  useEffect(() => {
    if (!subject) return

    getProgress(userId, subject).then((res) => {
      setProgress(res.data)
    })
  }, [subject])

  if (!progress) return <p>Loading...</p>

  const handleStart = (level) => {
    navigate("/mock-exam/exam", { state: { level, subject } })
  }

  return (
    <div >
      <h1 className="text-2xl font-bold text-center my-6 relative">Mock Exams Level</h1>
      <hr></hr>
      {/* Subject selector */}
      <select value={subject} onChange={(e) => setSubject(e.target.value)}>
        {subjects.map((sub) => (
          <option key={sub._id} value={sub.name}>
            {sub.name}
          </option>
        ))}
      </select>
    {/*Display level in level cards. If scored above 75%, it is unlocked */}
    {/*Error: Do not fetch data from db*/}
      <Level
        name="Easy"
        score={
          progress.easy?.attempted ? `${progress.easy.bestScore}%` : "Not Tried"
        }
        unlocked={true}
        onStart={() => handleStart("Easy")}
      />

      <Level
        name="Intermediate"
        score={
          progress.intermediate?.attempted
            ? `${progress.intermediate.bestScore}%`
            : "Not Tried"
        }
        unlocked={(progress.easy?.bestScore || 0) >= 75}
        onStart={() => handleStart("Intermediate")}
      />

      <Level
        name="Advanced"
        score={
          progress.advanced?.attempted
            ? `${progress.advanced.bestScore}%`
            : "Not Tried"
        }
        unlocked={(progress.intermediate?.bestScore || 0) >= 75}
        onStart={() => handleStart("Advanced")}
      />
    </div>
  )
}
