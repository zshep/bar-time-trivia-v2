import { useEffect, useState } from "react";

export default function QuestionFc({ answer, setAnswer, playerAnswer, isHost = false }) {
    const [ answered, setAnswered] = useState(false);

    return (
        <div className="flex flex-col justify-center w-full">

            <div className="self-center mt-6">

                {isHost && (
                    <p>Correct Answers: {answer}</p>
                )}
                {!isHost && (
                    
                    <input
                        className="w-full text-center rounded-sm"
                        name="FrQuestion"
                        type="text"

                        value={playerAnswer}
                        placeholder="Answer"
                        onChange={(e) => setAnswer(e.target.value)}
                    />

                  )

                }

            </div>

        </div>
    )
}
