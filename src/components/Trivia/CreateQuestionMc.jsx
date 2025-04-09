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
        <div className="flex flex-col justify-center mt-4">

            <div className="flex flex-col ">
                <p className="text-lg text-wrap text-center">Answer Choices</p>
                <p>Note: The game will randomize the answer choices</p>
                <p>Select all the answers that are correct</p>
               
                    
                    {choices.map((choice, idx) => (
                        <div className="flex" key={idx}> 
                        
                        <input
                            className="border border-black text-center my-1"
                            value={choice}
                            placeholder={`Answer choice ${idx + 1}`}
                            onChange={(e) => handleChoiceChange(idx, e.target.value)}
                        />
                        <input
                            type="checkbox"
                            checked={answers.includes(choice)}
                            onChange={(e) => handleCheckboxChange(idx, e.target.checked)}
                            
                        />
                    
                        </div>

                    ))}
               

            </div>

        </div>
    )
}