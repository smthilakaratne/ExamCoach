import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProgress } from "../../services/mockExamApi";
import Level from "../../components/LevelCard"; 

export default function MockLevels() {
  
  const [subject, setSubject] = useState("Math"); // default subject
  const navigate = useNavigate();
  const fixedUserId = "64f1c5a2f9a0b123456789ab";
  const [progress, setProgress] = useState({
    easy: { attempted: false, bestScore: 0 },
    intermediate: { attempted: false, bestScore: 0 },
    advanced: { attempted: false, bestScore: 0 },
  });
  
  useEffect(() => {
  getProgress(fixedUserId, subject).then((res) => {
    console.log(res.data);
    setProgress(res.data);
  });
}, [subject]);


  if (!progress) return <p>Loading...</p>;

  const handleStart = (level) => {
    navigate("/mock-exam/exam", { state: { level, subject } });
  };

  return (
    <div>
      <h2>Mock Exams Level</h2>

      {/* Subject selector */}
      <select value={subject} onChange={(e) => setSubject(e.target.value)}>
        <option value="Math">Math</option>
        <option value="Science">Science</option>
        <option value="English">English</option>
        <option value="History">History</option>
        <option value="Geography">Geography</option>
      </select>

      <Level
  name="Easy"
  score={
    progress.easy?.attempted
      ? `${progress.easy.bestScore}%`
      : "Not Tried"
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
  );
}
