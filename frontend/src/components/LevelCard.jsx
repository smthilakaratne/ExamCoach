import { useLocation, useNavigate } from "react-router-dom"

export default function Level({ name, score, unlocked, onStart }) {
  return (
    <div style={{ margin: "10px 0", opacity: unlocked ? 1 : 0.5 }}>
      <h3>{name}</h3>
      <p>Score: {score}</p>
      <button onClick={onStart} disabled={!unlocked}>
        Start
      </button>
    </div>
  )
}
