import { useLocation, useNavigate } from "react-router-dom"
import Button from "../components/Button"

export default function Level({ name, score, unlocked, onStart }) {
  return (
    <div className={`space-y-4 border-black border-2 rounded-lg p-6 m-4 ${unlocked ? "" : "opacity-50"}
        ${unlocked ? "" : "opacity-50"}
      `}> 
      <h3>Level: {name}</h3>
      <h3>Score: {score}</h3>
      <Button kind="primary" 
      className=" flex justify-center hover:bg-white hover:border hover:border-red-600 hover:text-red-600" //on hover
      onClick={onStart} disabled={!unlocked}>
        Start
      </Button>
    </div>
  )
}
