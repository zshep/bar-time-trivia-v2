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

    //normalize indexing:
    function toIndexChoice(rawChoice, question) {
        //console.log("indexing MC response")
        if (rawChoice == null) return undefined;
        if (typeof rawChoice === "number") return rawChoice;

        // Try to map from label/text → index
        //console.log("indexing question choices:", question.choices)
        const choices = question.choices || []; // e.g. [{label:'A'}, {label:'B'}]
        const getLabel = c => (typeof c === 'string' ? c : c?.label ?? c?.value);
        //console.log("choices:", choices);
        //console.log("choices", choices);

        if (Array.isArray(rawChoice)) {
            return rawChoice.map(txt => choices.findIndex(c => getLabel(c) === txt)).filter(i => i >= 0);
        }
        const idx = choices.findIndex(c => getLabel(c) === rawChoice);

        return idx >= 0 ? idx : undefined;
    }

    //normalizing correct answer to compare stuff
    function normalizeCorrectToIndexes(question) {
        const choices = question.choices || []; // ['A','B',...] or [{label:'A'}, ...]
        console.log("choices from nomralizer helper", choices);
        const labelOf = c => (typeof c === 'string' ? c : c?.label ?? c?.value ?? c?.text);

        const toIdx = (val) => {
            if (val == null) return undefined;
            if (typeof val === 'number') return val;                 // already an index
            if (!Number.isNaN(Number(val))) return Number(val);      // numeric string like "2"
            
            console.log("val", val);
            // label → index
            const idx = choices.findIndex(c => labelOf(c) === val);
            return idx >= 0 ? idx : undefined;
        };

        const raw = Array.isArray(question.correct) ? question.correct : [question.correct];
        console.log("raw:", raw);
        return raw.map(toIdx).filter(i => i !== undefined);        // always array of indexes
    }

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
            socket.off('player-list-update', handlePlayerListUpdate);
        }
    }, [isHost, sessionCode]);




    // scoring logic
    const scores = useMemo(() => {
        const tally = {};
        for (const [qid, payload] of Object.entries(roundAnswers)) {
            const { question, answersByPlayer } = payload;


            for (const [pId, ans] of Object.entries(answersByPlayer || {})) {


                //console.log('roundAnswers:', JSON.stringify(roundAnswers, null, 2));
                if (!tally[pId]) tally[pId] = { score: 0, detail: [] };

                let correct = false;

                if (question.type === "multipleChoice") {
                    console.log("grading MC question");
                    const correctIdx = normalizeCorrectToIndexes(question);
                    console.log("question:", question);
                    console.log("question.correct", question.correct);
                    console.log("correctIDX", correctIdx);
                    const playerIdx = Array.isArray(ans?.index)
                        ? ans.index.map(Number)
                        : (typeof ans?.index === 'number'
                            ? [Number(ans.index)]
                            : toIndexArrayFromText(ans?.text, question));             // fallback from labels

                    // choose policy: exact match of set (common for multi-select)
                    const exactSet = true;
                    if (exactSet) {
                        const a = [...new Set(playerIdx)].sort((x, y) => x - y);
                        const b = [...new Set(correctIdx)].sort((x, y) => x - y);
                        correct = a.length === b.length && a.every((v, i) => v === b[i]);
                    } else {
                        // “any correct selected” policy
                        correct = playerIdx.some(i => correctIdx.includes(i));
                    }
                } else if (question.type === "freeResponse") {

                    correct = null; // leaves FR as pending to be judged by host later
                }
                // record detail
                tally[pId].detail.push({
                    qid,
                    type: question.type,
                    choiceIndex: ans?.index ?? toIndexChoice(ans?.text, question),
                    choiceText: ans?.text,
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