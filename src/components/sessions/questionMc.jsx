import { useEffect, useState } from "react";

export default function QuestionMc({ choices={}, playerChoice = [], setPlayerChoice, isHost = false, correctAnswers = [] }) {

    //console.log("choices", choices);

    

    const handleCheckboxChange = (index, isChecked) => {
        const choice = choices[index];
        setPlayerChoice(prev =>
            isChecked
                ? [...prev, choice]
                : prev.filter(c => c !== choice)
        );
    };


    return (
        <div className="flex flex-col justify-center mt-2">


            <div className="flex flex-col ">
                <p className="text-lg text-wrap text-center">Answer Choices</p>

                

                {!isHost && <p>Select all the answers that are correct</p> }
                


                {choices.map((choice, idx) => (
                    <div className="flex justify-center w-full" key={idx}>

                        <p
                            className="border p-2 border-black text-center my-1 w-1/2"
                            id={idx}

                        > {choice || "Some Thing"} </p>

                        {!isHost && (
                             <input
                            className="ml-4 "
                            type="checkbox"
                            checked={playerChoice.includes(choice)}
                            onChange={(e) => handleCheckboxChange(idx, e.target.checked)}

                        />
                        )}
                       
                       

                    </div>

                ))}

                {isHost && (
                    <p>Correct Answers: {correctAnswers.join(",")}</p>
                )}
            </div>

        </div>
    )
}
