import {useEffect, useState} from 'react';
import getProgress from "../services/getProgress";

export default function MockLevels() {
    const [progress, setProgress] = useState(null);

    //fetch  progress data
     useEffect(() => {
    getProgress().then(res => setProgress(res.data));
  }, []);

  if (!progress) return <p>Loading...</p>;

  return (
    <div>
      <h2>Mock Exams</h2>
    
      <Level
        name="Easy"
        score={progress.easy.attempted ? `${progress.easy.bestScore}%` : "Not Tried"}
        unlocked={true}
      />

      <Level
        name="Intermediate"
        score={progress.intermediate.attempted ? `${progress.intermediate.bestScore}%` : "Not Tried"}
        unlocked={progress.easy.passed}
      />

      <Level
        name="Advanced"
        score={progress.advanced.attempted ? `${progress.advanced.bestScore}%` : "Not Tried"}
        unlocked={progress.intermediate.passed}
      />
    </div>
  );
}

//component for each level card
function Level({ name, score, unlocked }) {
  return (
    <div style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
      <h3>{name}</h3>
      <p>{score}</p>
      <button disabled={!unlocked}>
        {unlocked ? "Start Exam" : "Locked - Pass Previous Level"}
      </button>
    </div>
  );

}