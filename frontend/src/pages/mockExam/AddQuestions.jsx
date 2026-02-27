import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PreviewQuestionCard from "../../components/PreviewQuestionCard";
import Button from "../../components/button";

export default function PreviewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [level, setLevel] = useState("easy");
  const [subject, setSubject] = useState("math");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(5);

  //fetch questions from open trivia database based on selected level and subject
  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8888/api/mock-exams/questions?level=${level}&subject=${subject}`
      );
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
      
  };

  const handleAdd = (question) => {
  setSelectedQuestions((prev) => [...prev, question]);
};

//importing and adding questions to the database
const handleImport = async () => {
  try {
     const response = await axios.post(
      "http://localhost:8888/api/mock-exams/questions/import",
      {
        questions: selectedQuestions,
      }
    );
    console.log("Import response:", response.data);
    alert("Questions imported successfully");
  } catch (error) {
    console.error("Import failed:", error);           // logs AxiosError object
    console.error("Error response data:", error.response?.data);
  }
};

  return (
    <div>
      <h2 className="text-lg font-semibold text-center">Preview Questions</h2>
      {/* Level dropdown*/}
      <select onChange={(e) => setLevel(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

    {/*subject dropdown*/}
        <select onChange={(e) => setSubject(e.target.value)}>
        <option value="math">Math</option>
        <option value="science">Science</option>
        <option value="history">History</option>
      </select>

      <Button kind="dangerSecondary" className=" mt-4" onClick={fetchQuestions}>Fetch Questions</Button>
     {/*if no questions available or not clicked fetch button*/}
        {questions.length === 0 && <p className="text-center text-gray-500">No questions available. Please select level and subject.</p>}
      {/*Each question presented in preview card*/}
      <div className="space-y-4 border-black border-2 rounded-lg p-6 m-4">
        {questions.slice(0, visibleCount).map((q, index) => (
        <div key={`${q.questionText}-${index}`} className="mb-3">
          <PreviewQuestionCard question={q}/>
          <button onClick={() => handleAdd(q)}>
            Add Question
          </button>
        </div>

        ))}
        <Button kind="primary" 
        className="hover:bg-white hover:border hover:border-blue-600 hover:text-red-600"
        onClick={handleImport}>Import Selected</Button>
        <Button kind="secondary" 
        onClick={() => setVisibleCount(prev => prev + 5)}> View More</Button>
      </div>
    </div>
  );
}