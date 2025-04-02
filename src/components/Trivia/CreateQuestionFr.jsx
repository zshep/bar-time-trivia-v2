import { useEffect, useState } from "react"

export default function CreateQuestionFr( {answer, setAnswer} ) {


    
    return(
        <div className="flex flex-col justify-center w-full">
           

            <p className="text-2xl">Answer</p>
            <div>
               
                <input
                    className="w-full"
                    name="FrQuestion"
                    type="text"
                    
                    value={answer}
                    placeholder="Answer"
                    onChange={(e) => setAnswer(e.target.value)}
                />
            </div>
    
        </div>
    )
}