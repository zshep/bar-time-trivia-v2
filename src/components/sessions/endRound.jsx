import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import socket from "../../main";

export default function EndRound() {

    const { sessionCode } = useParams();
    const { state } = useLocation();
    const isHost = Boolean(state?.isHost);
    const roundAnswers = state?.roundAnswers || {};
    const [playersList, setPlayersList] = useState([]);
    const [resultsReady, setResultsReady] = useState(false);


    //logic for talling up scores
    useEffect(() => {
        if (!isHost) return;
        //send socket to grab player list
        socket.emit('request-player-list', { sessionCode });

        //grab list of players
        const handlePlayerListUpdate = ({ players }) => {
            //console.log("our list of players:", players);
            setPlayersList(players || []);
        }

        socket.on('player-list-update', handlePlayerListUpdate);
        return () => {
            socket.off('player-list-updated', handlePlayerListUpdate);
        }
    }, [isHost, sessionCode]);

    //normalize indexing:
    function toIndexChoice(rawChoice, question) {
        if (typeof rawChoice === "number") return rawChoice;

        // Try to map from label/text → index
        const choices = question.choices || []; // e.g. [{label:'A'}, {label:'B'}]
        const idx = choices.findIndex(
            c =>
                c?.label === rawChoice ||                // label match
                c?.value === rawChoice ||                // value match (if you have it)
                (typeof c === "string" && c === rawChoice) // simple string array
        );
        return idx >= 0 ? idx : undefined;
    }

    function isCorrectIndex(choiceIndex, question) {
        const correctSet = Array.isArray(question.correct)
            ? question.correct
            : [question.correct];

        // normalize all to numbers for comparison
        return correctSet.some(ci => Number(ci) === Number(choiceIndex));
    }


    // scoring logic
    const scores = useMemo(() => {
        const tally = {};
        for (const [qid, payload] of Object.entries(roundAnswers)) {
            const { question, answersByPlayer } = payload;

            for (const [pId, ans] of Object.entries(answersByPlayer || {})) {
                const rawChoice = ans?.choice;
                const correctSet = Array.isArray(question.correct) ? question.correct : [question.correct];
                //console.log("rawchoice", rawChoice);

                const normCorrect = correctSet.map(Number);
                const playerIndex = ans?.index;

                //console.log('roundAnswers:', JSON.stringify(roundAnswers, null, 2));
                if (!tally[pId]) tally[pId] = { score: 0, detail: [] };

                let correct = false;


                //console.log("answersByPlayer", answersByPlayer);
                if (question.type === "multipleChoice") {
                    
                    const choiceIndex = toIndexChoice(rawChoice, question);


                    correct = choiceIndex !== undefined && isCorrectIndex(choiceIndex, question);

                } else if (question.type === "freeResponse") {

                    correct = null; // leaves FR as pending to be judged by host later
                }
                // record detail
                tally[pId].detail.push({
                    qid,
                    type: question.type,
                    choice: rawChoice,
                    correct,
                });

                if (correct === true) {
                    tally[pId].score += question.points ?? 1;
                }
            }
        }

        return tally;
    }, [roundAnswers]);

    const handleFinalizeResults = () => {
        console.log(scores);
        setResultsReady(true);
    };

    //next round
    const handleNextRound = () => {
        console.log("host has click next round");
    }




    return (
        <div>
            <div className="flex flex-col mt-4">
                <h1>Round Results</h1>

            </div>
            <div className="flex flex-col">
                {!isHost && !resultsReady && (
                    <div>
                        <p>Waiting for Host to Finalize Results</p>
                    </div>
                )}
            </div>



            {isHost && !resultsReady && (
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