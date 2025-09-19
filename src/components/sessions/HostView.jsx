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
    const [ players, setPlayers ] = useState([]);


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

    //socket handlers to grab list of players
    useEffect(() => {
        if (!sessionCode) return;

        const handlePlayerListUpdate = ({ players }) => {
            setPlayers(players || []);
            console.log("players", players);
        };

        socket.emit("request-player-list", { sessionCode });
        socket.on("player-list-update", handlePlayerListUpdate);

        return() => {
            socket.off("player-list-update", handlePlayerListUpdate);
        };
    }, [sessionCode]);




    // Socket handlers for getting player answers
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
                    {players.map(p => (
                        <div key={p.id} className="flex justify-center gap-2"> 
                        <span className="font-mono">{p.name}</span>
                        <span>{answers[p.id] ? "answered" : "waiting"}</span>

                        </div>
                    )) }
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