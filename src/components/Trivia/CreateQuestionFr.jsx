import { useEffect, useState } from "react"

export default function CreateQuestionFr() {

    const [frAnswer, setFrAnswer] =useState("");

    
    return(
        <div className="flex flex-col justify-center w-full">
           

            <p className="text-2xl">Answer</p>
            <div>
                <label htmlFor="FrQuestion"></label>
                <textarea
                    className="w-full"
                    name="FrQuestion"
                    type="text"
                    autoFocus="false"
                    onChange={(e) => setFrAnswer(e.target.value)}
                    />
            </div>
    
        </div>
    )
}