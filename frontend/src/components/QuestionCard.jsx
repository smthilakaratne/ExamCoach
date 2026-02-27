// Question
export default function Question({ question, selectedAnswer, onSelect }) {
  return (
    <div className={`space-y-4 border-black border-2 rounded-lg p-6 m-4}`}>
      <p>{question.questionText}</p>
      {question.options.map((option, index) => (
        <div key={question._id + index}>
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
  )
}
