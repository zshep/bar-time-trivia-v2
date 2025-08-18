import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";
import { useEffect } from "react";
import socket from "../../main";
useEffect


export default function HostView({
    currentQuestion,
    questionType,
}) {

    console.log("current Question:", currentQuestion);
    const currentChoices = currentQuestion?.answer?.mcChoices || [];
    const correctAnswers = currentQuestion?.answer?.mcAnswers || [];

    useEffect(() => {

        const handleNewPlayerAnswer = ({playerId, choice, sessionCode}) => {
            console.log(`We have player ${playerId} give the answer ${choice} for session ${sessionCode} `);


        }
        
        socket.on("player-answer", handleNewPlayerAnswer);

        return () => {
            socket.off("player-answer", handleNewPlayerAnswer );
        }
    }, [])



    return (
        <div>

            <div>

                {questionType === "multipleChoice" && (
                    <QuestionMc choices={currentChoices} correctAnswers={correctAnswers} isHost />


                )}
                {questionType === "freeResponse" && (
                    /*<QuestionFc /> */
                    <p>I'm a FR Section</p>
                )}
            </div>

            <div className="mt-10">
                <div>
                    <p>I should list out players and status</p>
                </div>
                <div className="flex justify-between mt-4">
                    <button className="">Next Question</button>
                    <button>Previous Question</button>
                    <button>End Round</button>

                </div>
            </div>

        </div>

    )



}