import { useEffect, useState } from "react";

export default function CreateQuestionFr({ answer, setAnswer }) {
  return (
    <div className="w-full">
      <p className="text-sm font-semibold text-gray-700">Answer</p>

      <input
        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        name="FrQuestion"
        type="text"
        value={answer}
        placeholder="Answer"
        onChange={(e) => setAnswer(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
