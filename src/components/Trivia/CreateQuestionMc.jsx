import { useEffect, useState } from "react"

export default function CreateQuestionMc() {

    const [choiceNumber, setChoiceNumber] =useState(0);
    const [choiseAnswer, setChoiceAnswer] =useState([]);

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
                    onChange={(e) => setFrAnswer(e.target.value)}
                    />
            </div>
            
            <div className="flex flex-col ">
                <p className="text-lg text-wrap text-center">Answer Choices</p>
                <p>Note: The game will randomize the answer choices</p>
                <input
                    className="border border-black text-center my-1"
                    id="mcAnswer1"
                    placeholder="Answer choice 1"/>
                <input
                    className="border border-black text-center my-1"
                    id="mcAnswer2"
                    placeholder="Answer choice 2"
                     />
                <input
                    className="border border-black text-center my-1"
                    id="mcAnswer3"
                    placeholder="Answer choice 3" />
                <input 
                    className="border border-black text-center my-1"
                    id="mcAnswer4"
                    placeholder="Answer choice 4" />
                

            </div>
    
        </div>
    )
}