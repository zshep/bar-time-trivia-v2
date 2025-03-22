import { useEffect, useState } from "react"

export default function CreateQuestionMc() {

    [choiceNumber, setChoiceNumber] =useEffect(0);
    [choiseAnswer, setChoiceAnswer] =useEffect([]);

    // function to add answer choice


    //function to delete answer choice

    return(
        <div className="flex justify-center">
            <p>In mother Russia, Question make you!</p>

            <p className="text-2xl">this is Mc Question</p>

            <div>
                <p>Answer Choices</p>
                

            </div>
    
        </div>
    )
}