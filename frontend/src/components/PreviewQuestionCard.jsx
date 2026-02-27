import { useState } from "react";

export default function PreviewQuestionCard({ question }) {
  return (
    <div className="border p-4 rounded-md mb-3 bg-gray-50">
      <p className="font-medium mb-2">{question.questionText}</p>
      <ul className="list-disc ml-5">
        {question.options.map((option, index) => (
          <li key={index} className="mb-1">
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
}