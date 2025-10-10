import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import socket from "../../main";




export default function HostView({
    currentQuestion,
    sessionCode,
    roundData,
    goToNextQuestion,
    goToPrevQuestion,
}) {

    const navigate =useNavigate();

    //states for holding player data
    const [answers, setAnswers] = useState({});
    const [isLocked, setIsLocked] = useState(false);
    const [players, setPlayers] = useState([]);

    //modal states
    const [isEndRoundModalOpen, setIsEndRoundModalOpen] = useState(false);



    console.log("current Question:", currentQuestion);
    const currentChoices = currentQuestion?.choices || [];
    const correctAnswers = currentQuestion?.correct || [];
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
        goToNextQuestion();
    };

    //handle previous question
    const handlePreviousQuestion = () => {
        console.log("host clicked previous next question");
        setIsLocked(true);
        // compute previousIndex
        goToPrevQuestion()
    };
    // end round btn handler
    const handleEndRound = () => {
        console.log("host has clicked End Round");
        setIsLocked(true);
        setIsEndRoundModalOpen(true);   
    };

    const endRound = () => {
        console.log("Host has ended Round");
        setIsEndRoundModalOpen(false);
        socket.emit('end-round', { sessionCode });

        //navigate to endRound component 
          navigate(`/session/live/${sessionCodeRef.current}/end`, {
            state: {
                isHost: true,
            },
          });
    }


    return (
        <div>

            <div>

                {currentQuestion?.type === "multipleChoice" && (
                    <QuestionMc choices={currentQuestion.choices.map(c => c.label)} correctAnswers={currentQuestion.correct} isHost />


                )}
                {currentQuestion?.type === "freeResponse" && (
                    <QuestionFc answer={currentQuestion.correctText} isHost /> 
                    
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
                    <button
                        onClick={handlePreviousQuestion}>Previous Question</button>
                    <button
                        onClick={handleEndRound}
                        >End Round</button>

                </div>
            </div>

            {isEndRoundModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold">Confirm End Round</h3>
                        <p>Are you sure you want to end the round </p>
                        <div className="flex justify-between mt-4">
                             <button onClick={endRound} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700">
                                End Round
                            </button>
                            <button onClick={() => setIsEndRoundModalOpen(false)} className="mr-2 px-4 py-2 bg-red-300 rounded-full">
                                Cancel
                            </button>
                           
                        </div>
                    </div>
                </div>
            )}



        </div>

    )



}