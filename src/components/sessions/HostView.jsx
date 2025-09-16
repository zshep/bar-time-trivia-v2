import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";
import { useEffect, useState, useMemo, useRef } from "react";
import socket from "../../main";



export default function HostView({
    currentQuestion,
    questionType,
    sessionCode
}) {

    //states for holding player data
    const [ answers, setAnswers ] = useState({});
    const [ isLocked, setIsLocked] = useState(false);


    console.log("current Question:", currentQuestion);
    const currentChoices = currentQuestion?.answer?.mcChoices || [];
    const correctAnswers = currentQuestion?.answer?.mcAnswers || [];
    const questionId = currentQuestion?.id || "no-ID";

    // latest references 
    const sessionCodeRef = useRef(sessionCode);
    const questionIdRef =useRef(questionId);
    const isLockedRef =useRef(isLocked);
    

    useEffect(() => { sessionCodeRef.current = sessionCode; }, [sessionCode]);
    useEffect(() => { questionIdRef.current = questionId}, [questionId]);





    useEffect(() => {

        const handleNewPlayerAnswer = ({playerId, choice, sessionCode}) => {
            console.log(`Recieved answer from player ${playerId} give the answer ${choice} for session ${sessionCode} `);
            setAnswers(prev => ({
                ...prev,
                [playerId] : {
                    choice,
                    updatedAt: Date.now(),
                },
            }));
        };
        
        socket.on('submit-answer', handleNewPlayerAnswer);
        
        return () => {
            socket.off('submit-answer', handleNewPlayerAnswer );
        }
    }, []);

    // clear answers when question changes
    useEffect(() => {
        setAnswers({});
        setIsLocked(false);
    }, [questionId]);

    const answeredIds = useMemo(() => Object.keys(answers, [answers]));



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
        {/* TO DO!!!!! REFACTOR THIS CRAP BELOW TO DISPLAY PLAYER ANSWER PROPERLY*/}
            <div className="mt-10">
                <div>
                    {answeredIds.length > 0 ? (answeredIds.map((player) => (
                        <div key={player.playerid}>
                            <div> 
                                {player}
                            </div>
                            <div> 
                                <p>Answered??</p>
                            </div>
                        </div>
                    ))) : (<p>Players have not answered</p>)}
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