import { useEffect, useState } from "react"

export default function CreateQuestionMc({ answers, setAnswers, choices, setChoices }) {

    console.log(answers);
    console.log(choices);

    //updates array in parent's whenever user types
    const handleChoiceChange = (index, newValue) => {
        const updated = [...choices];
        updated[index] = newValue;
        setChoices(updated);
    }

    const handleCheckboxChange = (index, isChecked) => {
        const choiceValue = choices[index];
        if (isChecked) {
            setAnswers((prev) => [...prev, choiceValue])
        } else {
            //remove if unchecked
            setAnswers((prev) => prev.filter((val) => val !== choiceValue));
        }
    };


    // function to add answer choice
    //function to delete answer choice

    return (
       <div className="w-full">
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div className="mb-4">
      <p className="text-lg font-semibold text-gray-900">Answer Choices</p>
      <p className="mt-1 text-sm text-gray-600">
        The game will randomize answer choices. Check all correct answers.
      </p>
    </div>

    <div className="space-y-2">
      {choices.map((choice, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-2"
        >
          <input
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            value={choice}
            placeholder={`Answer choice ${idx + 1}`}
            onChange={(e) => handleChoiceChange(idx, e.target.value)}
          />

          <input
            type="checkbox"
            className="h-5 w-5 accent-gray-900"
            checked={answers.includes(choice)}
            onChange={(e) => handleCheckboxChange(idx, e.target.checked)}
          />
        </div>
      ))}
    </div>
  </div>
</div>
    )
}