import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL
export default function PreviewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [level, setLevel] = useState("easy");
  const [subject, setSubject] = useState("math");
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    /*try {
      const response = await axios.get(
        `http://localhost:8888/api/admin/mockexam/questions?level=${level}`
      );
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
      */
  };

  if (questions.length === 0) {
    return (<p>No questions available for the selected level.</p>); }

  return (
    <div>
      <h2>Preview Questions</h2>

      <select onChange={(e) => setLevel(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

        <select onChange={(e) => setSubject(e.target.value)}>
        <option value="math">Math</option>
        <option value="science">Science</option>
        <option value="history">History</option>
      </select>

      <button onClick={fetchQuestions}>Fetch Questions</button>

      <div>
        {questions.map((q, index) => (
          <div key={index}>
            <h4>{q.questionText}</h4>
            <ul>
              {q.options.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>
            <button onClick={() => {}}>Remove Question</button>
            <button onClick={() => {}}>Edit Question</button>
          </div>
        ))}
        <button>View More</button>
      </div>
    </div>
  );
}