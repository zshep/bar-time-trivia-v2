import { useEffect, useState } from "react"

export default function CreateQuestionFr() {

    [choiceNumber, setChoiceNumber] =useEffect(0);
    




    return(
        <div className="flex justify-center">
            <p>In mother Russia, Question make you!</p>

            <p className="text-2xl">this is Fr Question</p>
            <div>
                <label htmlFor="FrQuestion"></label>
                <input
                    type="text"
                    autoFocus="false"/>
            </div>

            <div>
                <p>Answer Choices</p>
                

            </div>
    
        </div>
    )
}