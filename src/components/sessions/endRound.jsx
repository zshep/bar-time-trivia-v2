import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import socket from "../../main";

export default function EndRound() {

    const { sessionCode } = useParams();
    const { state } = useLocation();
    const isHost =Boolean(state?.isHost);
    const roundAnswers = state?.roundAnswers || {};
    const [playersList, setPlayersList] = useState([]);
    const [resultsReady, setResultsReady] = useState(false);

    
    //logic for talling up scores
    useEffect( () =>{
        if (!isHost) return;
        //send socket to grab player list
        socket.emit('request-player-list', {sessionCode});

        //grab list of players
        const handlePlayerListUpdate = ({ players }) => {
            //console.log("our list of players:", players);
            setPlayersList(players || []);
        }

        socket.on('player-list-update', handlePlayerListUpdate);
        return () => {
            socket.off('player-list-updated', handlePlayerListUpdate);
        }
    },[isHost, sessionCode]);

    // scoring logic
    const scores = useMemo(() => {
        const tally = {};
        for (const [qid, payload] of Object.entries(roundAnswers)) {
            const { question, answersByPlayer } = payload;
            for (const [pId, {choice}] of Object.entries(roundAnswers)) {
                if (!tally[pId]) tally[pId] = { score: 0, detail: [] };

                let correct = false;
                if (question.type === "multipleChoice") {
                    console.log("correcting MC question", question);
                    correct = Array.isArray(question.correct) ? question.correct.includes(choice) : choice === question.correct;
                    console.log("correct:", correct);
                    console.log("choice?", choice)
                    console.log("answers by player", answersByPlayer);
                    console.log("question object:", question);
                } else if(question.type === "freeResponse"){
                    console.log("here's the FR question object", question);
                    console.log("correctText:", question.correctText);
                    console.log("answers by player", answersByPlayer);
                    console.log("question object:", question);

                    correct = null; // leaves FR as pending to be judged by host later
                    
                }

                tally[pId].detail.push({qid, type: question.type, choice, correct});
                if (correct === true) tally[pId].score += question.points ?? 1;
            }
        }
        return tally;
    },[roundAnswers]);

    const handleFinalizeResults = () => {
        console.log(scores);
        setResultsReady(true);
    };
    
    //next round
    const handleNextRound = () => {
        console.log("host has click next round");
    }




    return(
        <div>
            <div className="flex flex-col mt-4">
            <h1>Round Results</h1>

            </div>
            <div className="flex flex-col">
                {!isHost && !resultsReady &&(
                    <div> 
                        <p>Waiting for Host to Finalize Results</p>
                    </div>
                )}
            </div>



            {isHost && !resultsReady  && (
                <div className="space-y-4">
                    <div>
                        <p>You need to go through the results</p>
                    </div>
                    <div className="mt-4"> 
                        <button
                        onClick={handleFinalizeResults}
                        >Finalize Results</button>
                    </div>               
                </div>

            )}
            {resultsReady && (
                <div>
                    <p>These are the results</p>

                    <div>
                            {playersList.map(player => {
                                const s = scores[player.id] || { score: 0, detail: [] };
                                return (
                                    <div key={player.id} className="border rounded p-3 mt-4">
                                        <div>{player.name}</div>
                                        <div>Total: {s.score} </div>
                                        <ul className="list-disc ml-6">
                                            {s.detail.map(d => (
                                                <li key={`${d.id}-${d.qid}`}>
                                                    Q {d.qid}: {d.type === "freeResponse" ? "FR (pending)" : d.correct ? "Correct" : "Wrong"}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        
                    </div>

                </div>
                
            )}
            {resultsReady && isHost && (
                <div>
                    <button
                        className="border border-green-500 rounded">
                        Start Next Round
                    </button>
                </div>
            )}



        </div>
    )
}