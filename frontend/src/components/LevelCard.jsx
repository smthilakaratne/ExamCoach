import { useLocation, useNavigate } from "react-router-dom";

export default function LevelCard({ level, result }) {
const location = useLocation();
  const { level, result } = location.state || {};
  
  //update for each
  return (
    <>
    <div style={{ marginBottom: "25px" }}>
      <h3>{level}</h3>
      <p>Result: {result}</p>
    </div>
    <p>You should score atleast 80% to unlock next level.</p>
    </>
  );
}
