import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PreviewQuestionCard from "../../components/PreviewQuestionCard";
import Button from "../../components/button";

const API_URL = import.meta.env.VITE_API_URL;

export default function PreviewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [level, setLevel] = useState("easy");
  const [subject, setSubject] = useState("math");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(5);

  // fetch questions
  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/mock-exams/questions?level=${level}&subject=${subject}`
      );
      setQuestions(response.data);
      setSelectedQuestions([]); // reset selection on new fetch
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleAdd = (question) => {
    setSelectedQuestions((prev) => {
      const exists = prev.find(
        (q) => q.questionText === question.questionText
      );

      if (exists) {
        return prev.filter(
          (q) => q.questionText !== question.questionText
        );
      } else {
        return [...prev, question];
      }
    });
  };

  // ✅ import selected questions
  const handleImport = async () => {
    try {
      console.log("Selected Questions:", selectedQuestions);

      const response = await axios.post(
        `${API_URL}/api/mock-exams/questions/import`,
        {
          questions: selectedQuestions,
        }
      );

      const count = response.data.importedCount;

      if (count === 0) {
        alert("No new questions imported (duplicates)");
      } else {
        alert(`${count} questions imported successfully`);
      }

      setSelectedQuestions([]); // clear after import
    } catch (error) {
      console.error("Import failed:", error);
      console.error("Error response data:", error.response?.data);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-center">
        Preview Questions
      </h2>

      {/* Level dropdown */}
      <select onChange={(e) => setLevel(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      {/* Subject dropdown */}
      <select onChange={(e) => setSubject(e.target.value)}>
        <option value="math">Math</option>
        <option value="science">Science</option>
        <option value="history">History</option>
      </select>

      <Button
        kind="dangerSecondary"
        className="mt-4"
        onClick={fetchQuestions}
      >
        Fetch Questions
      </Button>

      {questions.length === 0 && (
        <p className="text-center text-gray-500">
          No questions available. Please select level and subject.
        </p>
      )}

      <div className="space-y-4 border-black border-2 rounded-lg p-6 m-4">
        {questions.slice(0, visibleCount).map((q, index) => {
          const isSelected = selectedQuestions.some(
            (sel) => sel.questionText === q.questionText
          );

          return (
            <div
              key={`${q.questionText}-${index}`}
              className={`mb-3 p-2 ${
                isSelected ? "bg-green-100" : ""
              }`}
            >
              <PreviewQuestionCard question={q} />

              <button onClick={() => handleAdd(q)}>
                {isSelected ? "Remove" : "Add Question"}
              </button>
            </div>
          );
        })}

        {/* Import button with count + disabled */}
        <Button
          kind="primary"
          onClick={handleImport}
          disabled={selectedQuestions.length === 0}
        >
          Import Selected ({selectedQuestions.length})
        </Button>

        <Button
          kind="secondary"
          onClick={() => setVisibleCount((prev) => prev + 5)}
        >
          View More
        </Button>
      </div>
    </div>
  );
}