import { useEffect, useState } from "react";

export default function QuestionMc({ choices, playerChoice, setPlayerChoice}){
   
    console.log("choices", choices);

    
    const handleCheckboxChange = (index, isChecked) => {
        console.log("a box was checked", index);

        const choiceValue = playerChoice[index];
        console.log("choice Value:", playerChoice);

        if (isChecked) {
            setPlayerChoice((prev) => [...prev, choiceValue])
        } else {
            //remove if unchecked
            setPlayerChoice((prev) => prev.filter((val) => val !== choiceValue));
        }
    };
    

    return(
        <div className="flex flex-col justify-center mt-2">
            

        <div className="flex flex-col ">
            <p className="text-lg text-wrap text-center">Answer Choices</p>
           
            <p>Select all the answers that are correct</p>
           
                
                {choices.map((choice, idx) => (
                    <div className="flex justify-center" key={idx}> 
                    
                    <p
                        className="border p-2 border-black text-center my-1"
                        id={idx}
                        
                    > {choice || "Some Thing"} </p>
                    <input
                        className="ml-4"
                        type="checkbox"
                        checked={playerChoice.includes(choice)}
                        onChange={(e) => handleCheckboxChange(idx, e.target.checked)}
                        
                    />
                
                    </div>

                ))}
           

        </div>

    </div>
    )
}
