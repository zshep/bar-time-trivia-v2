export default function QuestionMc({ 
    choices=[], 
    selectedIndexes = [], 
    setSelectedIndexes, 
    isHost = false, 
    correctAnswers = [] 
}) {

    //console.log("choices", choices);

    

    const handleCheckboxChange = (idx, isChecked) => {
    setSelectedIndexes(prev =>
      isChecked ? [...prev, idx] : prev.filter(i => i !== idx)
    );
  };


    return (
        <div className="w-full">
  <div className="mx-auto w-full max-w-2xl">
    <div className="text-center">
      <p className="text-lg font-semibold text-gray-900">Answer Choices</p>
      {!isHost && (
        <p className="mt-1 text-sm text-gray-600">
          Select all answers that are correct.
        </p>
      )}
    </div>

    <div className="mt-4 space-y-2">
      {choices.map((choice, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
        >
          <p className="text-sm font-medium text-gray-900">
            {choice || "—"}
          </p>

          {!isHost && (
            <input
              className="h-5 w-5 accent-gray-900"
              type="checkbox"
              checked={selectedIndexes.includes(idx)}
              onChange={(e) => handleCheckboxChange(idx, e.target.checked)}
            />
          )}
        </div>
      ))}
    </div>

    {isHost && (
      <p className="mt-4 text-sm text-gray-700">
        <span className="font-semibold text-gray-900">Correct answers:</span>{" "}
        {correctAnswers.join(", ")}
      </p>
    )}
  </div>
</div>
    )
}
