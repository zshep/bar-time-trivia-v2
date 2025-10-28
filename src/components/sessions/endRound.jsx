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
    const [frModalOpen, setFrModalOpen] = useState(false);
    const [frCorrectAnswer, setFrCorrectAnswer] =useState("");
    const [frPlayerAnswer, setFrPlayerAnswer] = useState("");
    const [currentPlayer, setCurrentPlayer] = useState("");

    //normalize indexing:
    function buildChoiceIndexMap(choices = []) {
        const map = new Map();
        choices.forEach((c, idx) => {
            const label = typeof c === 'string' ? c : (c?.label ?? c?.calue ?? c?.text);
            const id = (typeof c === 'object' && c?.id != null) ? String(c.id) : undefined;

            if (label) map.set(String(label).trim(), idx);
            if (id) map.set(String(id).trim(), idx);

            //allow numeric string index lookups
            map.set(String(idx), idx);
        });
        return map;
    }

    // normalize correct answers:
    function normalizeCorrectToIndexes(question) {
        const { choices = [], correct } = question || {};
        const idxMap = buildChoiceIndexMap(choices);
        const arr = Array.isArray(correct) ? correct : [correct];

        const out = arr.map(v => {
            if (typeof v === 'number') return v;
            if (v == null) return undefined;
            const key = String(v).trim();
            const hit = idxMap.get(key);
            return hit !== undefined ? hit : undefined;
        })
            .filter(i => i !== undefined);

        return out;
    }

    //fallback when a player's answer came as labels/text
    function toIndexArrayFromText(raw, question) {
        if (raw == null) return [];
        const idxMap = buildChoiceIndexMap(question?.choices || []);
        const arr = Array.isArray(raw) ? raw : [raw];

        return arr.map(v => {
            const key = String(v).trim();
            const hit = idxMap.get(key);
            return hit !== undefined ? hit : undefined;
        })
            .filter(i => i !== undefined);
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

                //debugging sanity check
                console.log({
                    choices: question.choices,
                    correctRaw: question.correct,
                    correctIdx: normalizeCorrectToIndexes(question),
                    playerRaw: { index: ans?.index, text: ans?.text },
                    playerIdx: Array.isArray(ans?.index)
                        ? ans.index
                        : (typeof ans?.index === 'number' ? [ans.index] : toIndexArrayFromText(ans?.text, question)),
                });

                //console.log('roundAnswers:', JSON.stringify(roundAnswers, null, 2));
                if (!tally[pId]) tally[pId] = { score: 0, detail: [] };

                let correct = false;

                if (question.type === "multipleChoice") {
                    const correctIdx = normalizeCorrectToIndexes(question);

                    const playerIdx = Array.isArray(ans?.index)
                        ? ans.index.map(Number)
                        : (typeof ans?.index === 'number'
                            ? [Number(ans.index)]
                            : toIndexArrayFromText(ans?.text, question)
                        );


                    //exact set MC policy
                    const a = [...new Set(playerIdx)].sort((x, y) => x - y);
                    const b = [...new Set(correctIdx)].sort((x, y) => x - y);
                    correct = a.length === b.length && a.every((v, i) => v === b[i]);

                } else if (question.type === "freeResponse") {

                    console.log("Fr Correct answer", question.correctText);
                    console.log("player answer", ans.text);
                    console.log("playerId:", pId);
                    setFrCorrectAnswer(question.correct);
                    setFrPlayerAnswer(ans.text);
                    setCurrentPlayer(pId);

                    if (question.correctText === ans.text) {
                        console.log("FR correct");
                        correct = true;
                    } else {
                        console.log("FR is incorrect");
                        //Need to set up logic for host double check FR question:
                        correct = false;
                        setFrModalOpen(true);

                    }

                    
                }
                // record detail
                tally[pId].detail.push({
                    qid,
                    type: question.type,
                    choiceIndex: ans?.index,
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
    //FR correct
    const handleCorrectFr = () => {
        console.log("the host thinks this is correct");
        correct = true;
        setFrModalOpen(false);
    }
    const handleIncorrectFr = () => {
        console.log("the host thinks this is incorrect");
        correct = false;
        setFrModalOpen(false);
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
            {isHost && frModalOpen && (
                <div> 
                    <div>
                        <p>Double Check Free Response for player {currentPlayer}</p>    
                    </div>
                    <div className="flex-col"> 
                        <p>Correct Answer: {frCorrectAnswer}</p>
                        <p>Player Answer: {frPlayerAnswer}</p>
                    </div>
                    <div> 
                        <button onClick={handleCorrectFr}>Correct</button>
                        <button onClick={handleIncorrectFr}>Incorrect</button>
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
                                <div key={player.id} className="border rounded p-3 mt-4 flex-row">
                                        <div>{player.name} : {s.score}</div> 
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