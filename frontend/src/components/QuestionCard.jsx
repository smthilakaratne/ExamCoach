// Question
export default function Question({ question, selectedAnswer, onSelect }) {
  return (
    <div>
      <p>{question.question}</p>
      {question.options.map((option, index) => (
        <div key={index}>
          <input
            type="radio"
            name={question._id}
            checked={selectedAnswer === index}
            onChange={() => onSelect(question._id, index)}
          />
          <label>{option}</label>
        </div>
      ))}
    </div>
  );
}
