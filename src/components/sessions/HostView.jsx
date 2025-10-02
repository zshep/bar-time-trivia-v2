import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";
import { useEffect, useState, useMemo, useRef } from "react";
import socket from "../../main";



export default function HostView({
    currentQuestion,
    questionType,
    sessionCode,
    roundData,
    goToNextQuestion,
}) {

    //states for holding player data
    const [answers, setAnswers] = useState({});
    const [isLocked, setIsLocked] = useState(false);
    const [players, setPlayers] = useState([]);


    console.log("current Question:", currentQuestion);
    const currentChoices = currentQuestion?.answer?.mcChoices || [];
    const correctAnswers = currentQuestion?.answer?.mcAnswers || [];
    const questionId = currentQuestion?.id || "no-ID";
    const frAnswer = currentQuestion?.answer || "";

    // latest references 
    const sessionCodeRef = useRef(sessionCode);
    const questionIdRef = useRef(questionId);
    const isLockedRef = useRef(isLocked);


    useEffect(() => { sessionCodeRef.current = sessionCode; }, [sessionCode]);
    useEffect(() => { questionIdRef.current = questionId }, [questionId]);
    useEffect(() => { isLockedRef.current = isLocked }, [isLocked]);

    //socket handlers to grab list of players
    useEffect(() => {
        if (!sessionCode) return;

        const handlePlayerListUpdate = ({ players }) => {
            setPlayers(players || []);
            console.log("players", players);
        };

        socket.emit("request-player-list", { sessionCode });
        socket.on("player-list-update", handlePlayerListUpdate);

        return () => {
            socket.off("player-list-update", handlePlayerListUpdate);
        };
    }, [sessionCode]);




    // getting player answers
    useEffect(() => {

        const handleNewPlayerAnswer = ({ playerId, choice, sessionCode, questionId }) => {

            //guards
            if (sessionCode && sessionCode !== sessionCodeRef.current) return;
            if (questionId && questionId !== questionIdRef.current) return;
            if (isLockedRef.current) return;

            //debug
            console.log(`Answer from ${playerId} for question ${questionId} playerids:`, players.map(p => p.id));

            setAnswers(prev => ({
                ...prev,
                [playerId]: {
                    choice,
                    updatedAt: Date.now(),
                },
            }));
        };

        socket.on('submit-answer', handleNewPlayerAnswer);

        return () => {
            socket.off('submit-answer', handleNewPlayerAnswer);
        }
    }, []);

    // clear answers when question changes
    useEffect(() => {
        setAnswers({});
        setIsLocked(false);
    }, [questionId]);

    //handle next question
    const handleNextQuestion = () => {
        console.log("Host click next question");

        //lock question
        setIsLocked(true);
        //compute nextIndex
        goToNextQuestion(sessionCode);

    }


    return (
        <div>

            <div>

                {questionType === "multipleChoice" && (
                    <QuestionMc choices={currentChoices} correctAnswers={correctAnswers} isHost />


                )}
                {questionType === "freeResponse" && (
                    <QuestionFc answer={frAnswer} isHost /> 
                    
                )}
            </div>

            <div className="mt-10">
                <div>
                    {players.map(p => (
                        <div key={p.id} className="flex justify-center gap-2">
                            <span className="font-mono">{p.name}</span>
                            <span>{answers[p.id] ? "answered" : "waiting"}</span>

                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4">
                    <button
                        onClick={handleNextQuestion}
                        className="">
                        Next Question</button>
                    <button>Previous Question</button>
                    <button>End Round</button>

                </div>
            </div>

        </div>

    )



}