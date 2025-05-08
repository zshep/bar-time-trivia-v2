import { useEffect, useState } from "react";

export default function QuestionFc( {answer, setAnswer} ){

    return(
        <div className="flex flex-col justify-center w-full">
           
            <div className="self-center">
               
                <input
                    className="w-full text-center"
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
