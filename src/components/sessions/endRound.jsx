import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import socket from "../../main";
import { io } from "socket.io-client";

export default function EndRound() {

    const navigate = useNavigate();
    const { sessionCode } = useParams();
    const { state } = useLocation();
    const isHost = Boolean(state?.isHost);
    const roundAnswers = state?.roundAnswers || {};
    const [playersList, setPlayersList] = useState([]);
    const [resultsReady, setResultsReady] = useState(false);
    const [frPlayerAnswer, setFrPlayerAnswer] = useState("");
    const [currentPlayer, setCurrentPlayer] = useState("");
    const [frCorrectAnswer, setFrCorrectAnswer] = useState("");
    const [frDecisions, setFrDecisions] = useState({}); // {[qid]: {[pid] : true|false} }
    const [frModalOpen, setFrModalOpen] = useState(false);
    const [frCursor, setFrCursor] = useState(0);
    const [finalScores, setFinalScores] = useState(null);
    const [frozenHostScores, setFrozenHostScores] = useState(null);

    // normalize answers for easier comparrison
    function norm(s) {
        return String(s ?? "").trim().replace(/\s+/g, "").toLowerCase();
    }

    
    // Build a list of FR items that need host review
    const pendingFR = useMemo(() => {
        const list = [];
        for (const [qid, payload] of Object.entries(roundAnswers || {})) {
            const { question, answersByPlayer } = payload || {};
            if (!question || question.type !== "freeResponse" || !answersByPlayer) continue;

            const correctText = norm(question.correctText);
            for (const [pId, ans] of Object.entries(answersByPlayer)) {
                const playerText = norm(ans?.text);
                const autoMatch = correctText && playerText && correctText === playerText;

                // if auto correct -> not pending; if we already decided -> not pending
                const decided = frDecisions[qid]?.[pId];
                if (!autoMatch && decided == null) {
                    list.push({
                        qid,
                        pId,
                        correctText: question.correctText ?? "",
                        playerText: ans?.text ?? "",
                    });
                }
            }
        }
        return list;
    }, [roundAnswers, frDecisions]);

    // Open/close modal when there are items to adjudicate
    useEffect(() => {
        if (!isHost || resultsReady) return;
        if (pendingFR.length > 0) {
            setFrModalOpen(true);
            setFrCursor((idx) => Math.min(idx, pendingFR.length - 1)); // keep cursor in range
        } else {
            setFrModalOpen(false);
            setFrCursor(0);
        }
    }, [pendingFR, isHost, resultsReady]);


    // Host actions for FR decisions
    function setDecisionFor(qid, pId, value /* true|false */) {
        setFrDecisions(prev => ({
            ...prev,
            [qid]: { ...(prev[qid] || {}), [pId]: value },
        }));
        // advance
        setFrCursor((i) => (i + 1 < pendingFR.length ? i + 1 : 0));
    }

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

    //socket listener for players endround final results
    useEffect(() => {
        if (isHost) return;
        const handleFinalRoundData = ({ finalRoundData }) => {
            console.log("finalROundData", finalRoundData);
            setPlayersList(finalRoundData.playersList);
            setFinalScores(finalRoundData.scores || {});
            setResultsReady(true);
        }
        socket.on('round-finalized', handleFinalRoundData);
        return () => {
            socket.off('round-finalized', handleFinalRoundData);
        }

    },[isHost]);




    // scoring logic
    const scores = useMemo(() => {
        const tally = {};
        for (const [qid, payload] of Object.entries(roundAnswers || {})) {
            const { question, answersByPlayer } = payload;

            if (!question || !answersByPlayer) continue;

            const ensure = (pid) => (tally[pid] ??= { score: 0, detail: [] });


            for (const [pId, ans] of Object.entries(answersByPlayer || {})) {

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


                    const auto = norm(question.correctText) === norm(ans?.text);
                    const decided = frDecisions[qid]?.[pId];
                    if (auto) correct = true;

                    else if (typeof decided === "boolean") correct = decided;
                    else correct = null;
                }


                // record detail
                ensure(pId).detail.push({
                    qid,
                    type: question.type,
                    choiceIndex: ans?.index,
                    choiceText: ans?.text,
                    correct,
                });

                if (correct === true) ensure(pId).score += question.points ?? 1;
            }
        }

        return tally;
    }, [roundAnswers, frDecisions]);

    //setting display scores for all
    const displayScores = useMemo(() => {
        if (resultsReady){
            return isHost ? (frozenHostScores || {}) : (finalScores || {});
        }

        return isHost ? (scores || {}) : {};
    }, [isHost, resultsReady, scores, frozenHostScores, finalScores]);

    const handleFinalizeResults = () => {

        //freezing current computed scoers to host UI stops being derived
        const frozen = JSON.parse(JSON.stringify(scores));
        setFrozenHostScores(frozen);

        //console.log(scores);
        const finalRoundData = {
            sessionCode: sessionCode,
            playersList,
            scores: frozen,
        }
        
        //console.log("emitting round data:", finalRoundData);
        socket.emit('results-finalized', {finalRoundData});
        setResultsReady(true);

    };

    
    
    const handleCorrectFr = () => {
        const item = pendingFR[frCursor];
        if (!item) return;
        setDecisionFor(item.qid, item.pId, true);
    };
    
    const handleIncorrectFr = () => {
        const item = pendingFR[frCursor];
        if (!item) return;
        setDecisionFor(item.qid, item.pId, false);
    };
    
    //next round
    const handleNextRound = () => {
        console.log("host has click next round");
     
        //send results/people to next round
        socket.emit('next-round', { sessionCode });

        //navigate to LiveMainPage
        navigate(`/session/live/${sessionCode}`);
    }

    //next round socket listener 
    useEffect(() => {
        socket.on('round-changed',({sessionCode, roundNumber, roundId, totalRounds }) =>{
            navigate(`/session/live/${sessionCode}`)
        })
    })


   

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
                            className={`mt-4 px-4 py-2 rounded ${pendingFR.length>0 ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}
                        > {pendingFR.length > 0 ? `Review ${pendingFR.length}` : 'Finalize Results'}</button>
                    </div>
                </div>

            )}
            {isHost && frModalOpen && pendingFR.length > 0 && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-2">
                            Review Free Response ({frCursor + 1} of {pendingFR.length})
                        </h3>
                        <div className="space-y-2">
                            <div><span className="font-semibold">Player:</span> {pendingFR[frCursor].pId}</div>
                            <div><span className="font-semibold">Correct Answer:</span> {pendingFR[frCursor].correctText}</div>
                            <div><span className="font-semibold">Player Answer:</span> {pendingFR[frCursor].playerText}</div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={handleCorrectFr} className="px-4 py-2 rounded bg-green-600 text-white">Correct</button>
                            <button onClick={handleIncorrectFr} className="px-4 py-2 rounded bg-red-500 text-white">Incorrect</button>
                            <button onClick={() => setFrModalOpen(false)} className="ml-auto px-4 py-2 rounded bg-gray-200">Close</button>
                        </div>
                    </div>
                </div>
            )}
            {resultsReady && (
                <div>
                    <p>These are the results</p>

                    <div>
                        {playersList.map(player => {
                            const s = displayScores[player.id] || { score: 0, detail: [] };
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
                        className="border border-green-500 rounded mt-4"
                        onClick={handleNextRound}>
                        Start Next Round
                    </button>
                </div>
            )}



        </div>
    )
}