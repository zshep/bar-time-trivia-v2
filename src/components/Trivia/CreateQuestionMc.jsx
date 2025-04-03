import { useEffect, useState } from "react"

export default function CreateQuestionMc({answers, setAnswers}) {

    //updates array in parent's whenever user types
    const handleAnswerChange = (index, newValue) => {
        const updated =[...answers];
        updated[index] = newValue;
        setAnswers(updated);
    }

    // function to add answer choice


    //function to delete answer choice

    return(
        <div className="flex flex-col justify-center">
             <p className="text-2xl">Answer</p>
            <div>
                <label htmlFor="FrQuestion"></label>
                <input
                    className="w-full"
                    name="FrQuestion"
                    type="text"
                    autoFocus="false"
                    onChange={(e) => setAnswers(e.target.value)}
                    />
            </div>
            
            <div className="flex flex-col ">
                <p className="text-lg text-wrap text-center">Answer Choices</p>
                <p>Note: The game will randomize the answer choices</p>
               {answers.map((ans, idx) => (
                    <input
                        key={idx}
                        className="border border-black text-center my-1"
                        value={ans}
                        placeholder={`Answer choice ${idx + 1}`}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    />

               ))}

            </div>
    
        </div>
    )
}