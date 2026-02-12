import { useEffect, useState } from "react";
import { startExam } from "../../services/mockExamApi";
import Question from "../../components/QuestionCard";

export default function MockExam({ level }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  //fetch data for selected level
  useEffect(() => {
    startExam(level).then(res => setQuestions(res.data.questions));
  }, [level]);

  //get answer for each question
  const selectAnswer = (qId, index) => {
    setAnswers({ ...answers, [qId]: index });
  };

  const handleSubmit = () => {
    //submit answers to backend and get score
    submit(answers, level);
    navigate("/exam-result", {
      state: { questions, answers, totalCorrect },
    });
  }

    return (
        <>
        <h1>{level} Exam</h1>
        
        {questions.map((q, i) => (   
          //use question card component
          <Question
          key={q._id}
          question={q}
          selectedAnswer={answers[q._id]}
          onSelect={selectAnswer}
        />
          
        ))} 

         {questions.length > 0 && (
        <button onClick={handleSubmit}>Submit Exam</button>
      )}
    </>
    );
}