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
    const [roundAnswers, setRoundAnswers] = useState({});


    const [isLocked, setIsLocked] = useState(false);
    const [players, setPlayers] = useState([]);
    const [isEndRoundModalOpen, setIsEndRoundModalOpen] = useState(false);

    const questionId = currentQuestion?.id || "no-ID";
   
    console.log("current Question:", currentQuestion);
    console.log("roundData", roundData.length);
  
    

    // latest references 
    const sessionCodeRef = useRef(sessionCode);
    const questionIdRef = useRef(questionId);
    const isLockedRef = useRef(isLocked);

    // refrence to previous question meta
    const lastQuestionRef = useRef(currentQuestion || null);


    useEffect(() => { sessionCodeRef.current = sessionCode; }, [sessionCode]);
    useEffect(() => { questionIdRef.current = questionId }, [questionId]);
    useEffect(() => { isLockedRef.current = isLocked }, [isLocked]);

    //socket handlers to grab list of players
    useEffect(() => {
        if (!sessionCode) return;

        const handlePlayerListUpdate = ({ players }) => {
            setPlayers(players || []);
            //console.log("players", players);
        };

        socket.emit("request-player-list", { sessionCode });
        socket.on("player-list-update", handlePlayerListUpdate);

        return () => {
            socket.off("player-list-update", handlePlayerListUpdate);
        };
    }, [sessionCode]);

    // getting player answers
    useEffect(() => {
        const handleNewPlayerAnswer = ({ playerId, choiceIndex, choiceText, sessionCode, questionId }) => {
            //guards
            if (sessionCode && sessionCode !== sessionCodeRef.current) return;
            if (questionId && questionId !== questionIdRef.current) return;
            if (isLockedRef.current) return;

            //debug
            console.log(`Answer from ${playerId} for question ${questionId} playerids with this answer ${choiceText} and index ${choiceIndex}`);

            setAnswers(prev => ({
                ...prev,
                [playerId]: {
                    index: choiceIndex,
                    text: choiceText,
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
        //saving answers to Round Array to pass onto host for end of round math
        const prevQ = lastQuestionRef.current;
        if (prevQ?.id) {

            setRoundAnswers(prev => ({
                ...prev,
                [prevQ.id]: {
                    question: {
                        id: prevQ.id,
                        type: prevQ.type,
                        choices: prevQ.choices ?? [],
                        correct: prevQ.correct ?? [],
                        correctText: prevQ.correctText ?? "",
                        points: prevQ.points?? 1,
                    },
                    answersByPlayer: answers,
                },
            }));

        }

        //preparing for new question
        setAnswers({});
        setIsLocked(false);

        //updating the ref so its piont to the *current* question for next time
        lastQuestionRef.current = currentQuestion || null;

    }, [questionId]);

    // snapshot the final quesiton of round before ending round
    const finalizeCurrentQuestionIntoRound = () => {
        const q = lastQuestionRef.current || currentQuestion;
        if (!q?.id) return;
        setRoundAnswers(prev => ({
            ...prev,
            [q.id]: {
                question: {
                    id: q.id,
                    type: q.type,
                    choices: q.choices ?? [],
                    correct: q.correct ?? [],
                    correctText: q.correctText ?? "",
                    points: q.points ?? 1,
                },
                answersByPlayer: answers,
            },
        }));
    }


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
        finalizeCurrentQuestionIntoRound();
        setIsEndRoundModalOpen(false);
        socket.emit('end-round', { sessionCode });

        const q = lastQuestionRef.current || currentQuestion;
        const merged = q?.id ?
        {
            ...roundAnswers,
            [q.id]: {
                question: {
                    id: q.id,
                    type: q.type,
                    choices: q.choices ?? [],
                    correct: q.correct ?? [],
                    correctText: q.correctText ?? "",
                    points: q.points ?? 1,
                },
                answersByPlayer: answers,
            },

        } : roundAnswers;


        //navigate to endRound component 
          navigate(`/session/live/${sessionCodeRef.current}/end`, {
            state: {
                isHost: true,
                roundAnswers: merged,
                players,
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
                    {roundData.length > currentQuestion?.number ? (
                        <button
                        onClick={handleNextQuestion}
                        className="m-2"
                        > Next Question </button>) : ( <p> </p>) }
                    {currentQuestion?.number > 1 ? (<button
                        onClick={handlePreviousQuestion}
                        className="m-2"
                        > Previous Question</button>) : ( <p> </p>)  }
                    
                    <button
                        onClick={handleEndRound}
                        className="m-2"
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