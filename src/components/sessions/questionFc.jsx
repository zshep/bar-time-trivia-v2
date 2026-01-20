import { useEffect, useState } from "react";

export default function QuestionFc({
  answer,
  setAnswer,
  playerAnswer,
  isHost = false,
}) {
  const [answered, setAnswered] = useState(false);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-md">
        {isHost ? (
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Correct answer:</span>{" "}
            {answer}
          </p>
        ) : (
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            name="FrQuestion"
            type="text"
            value={playerAnswer}
            placeholder="Answer"
            onChange={(e) => setAnswer(e.target.value)}
            autoComplete="off"
          />
        )}
      </div>
    </div>
  );
}
