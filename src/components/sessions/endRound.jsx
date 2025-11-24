import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import socket from "../../main";

export default function EndRound() {

    const navigate = useNavigate();
    const { sessionCode } = useParams();
    const { state } = useLocation();
    const isHost = Boolean(state?.isHost);
    const [hostId, setHostId] = useState(null);
    const [gameId, setGameId] = useState("");
    const [gameName, setGameName] = useState("");
    const roundAnswers = state?.roundAnswers || {};
    const [roundNumber, setRoundNumber] = useState(1);
    const [totalNumberRounds, setTotalNumberRounds] =useState(1);
    const [playersList, setPlayersList] = useState([]);
    const [resultsReady, setResultsReady] = useState(false);
    const [frDecisions, setFrDecisions] = useState({}); // {[qid]: {[pid] : true|false} }
    const [frModalOpen, setFrModalOpen] = useState(false);
    const [frCursor, setFrCursor] = useState(0);
    const [finalScores, setFinalScores] = useState(null);
    const [frozenHostScores, setFrozenHostScores] = useState(null);
    const [lastRound, setLastRound] = useState(false);

    // grabbing session info to navigate to next round
    useEffect(() => {

        if (!gameId || !gameName || !hostId) {
            socket.emit('request-session-info', { sessionCode });
        }

        const handleSessionInfo = ({ gameName, gameId, hostId, currentRound, totalRounds }) => {
            console.log("grabbing session Info from server")
            setGameName(gameName);
            setGameId(gameId);
            setHostId(hostId);
            setTotalNumberRounds(totalRounds);


            if (typeof currentRound === "number") {
                setRoundNumber((currentRound + 1));
            }
            
        };

        socket.on('session-info', handleSessionInfo);

        return () => socket.off('session-info', handleSessionInfo);
    }, [sessionCode])

    //checking if this is the last round
    useEffect(() => {
        
        console.log("roundNumber: ", roundNumber)
        console.log("totalNumberRounds", totalNumberRounds);

        const isLast = roundNumber === totalNumberRounds && totalNumberRounds > 0;
        setLastRound(isLast);
        console.log(`EndRound display: ${roundNumber} of ${totalNumberRounds}, last? ${isLast}`);

        if (isLast) {
            console.log("this is last round");
        }
    }, [isHost, roundNumber, totalNumberRounds]);

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

    //grabbing round data
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
        //if (isHost) return;
        const handleFinal = ({ sessionCode, roundIndex, roundScores, leaderboard }) => {
            console.log("final results roundSCores:", roundScores);
            console.log("final results leaderboard", leaderboard);
            setFinalScores({ roundIndex, roundScores, leaderboard });
            setResultsReady(true);
        }
        socket.on('round-finalized', handleFinal);
        return () => {
            socket.off('round-finalized', handleFinal);
        }

    }, []);




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
        if (resultsReady) {
            return isHost ? (frozenHostScores || {}) : (finalScores || {});
        }

        return isHost ? (scores || {}) : {};
    }, [isHost, resultsReady, scores, frozenHostScores, finalScores]);

    const handleFinalizeResults = () => {

        //freezing current computed scoers to host UI stops being derived
        const frozen = JSON.parse(JSON.stringify(scores));
        setFrozenHostScores(frozen);

        // determine roundIndex
        const roundIdx = (() => {
            // if wanting to send roundIndex
            if (typeof state?.roundIndex === "number") return state.roundIndex;

            if(typeof roundNumber === "number") return roundNumber;

            //fallback
            return 0;

        })();
        console.log("roundIdx going to server:", roundIdx);

        // set up data to be sent to server
        const roundScores = Object.entries(frozen).map(([pId, v]) => {
            const p = playersList.find(pl => pl.id === pId) || {};
            const playerId = p.userId ?? p.id ?? pId;
            const name = p.name ?? "";
            const roundScore = Number(v?.score ?? 0);

            return { playerId, name, roundScore }

        })

        //console.log(scores);
        const finalRoundData = {
            sessionCode: sessionCode,
            roundIndex: roundIdx,
            scores: roundScores,
        }

        console.log("emitting round data:", finalRoundData);
        socket.emit('results-finalized', { finalRoundData });
        setResultsReady(true);

    };

    //getting host input for correct FR    
    const handleCorrectFr = () => {
        const item = pendingFR[frCursor];
        if (!item) return;
        setDecisionFor(item.qid, item.pId, true);
    };

    //getting host input for incorrect FR
    const handleIncorrectFr = () => {
        const item = pendingFR[frCursor];
        if (!item) return;
        setDecisionFor(item.qid, item.pId, false);
    };

    //next round
    const handleNextRound = () => {

        console.log("host has click next round");
        console.log(`hostId: ${hostId}, gameName: ${gameName}, gameId:${gameId}, sessionCode: ${sessionCode}`);

        //send socket to next round
        socket.emit('next-round', { sessionCode });
    }

    //next round socket listener 
    useEffect(() => {
        const onRoundChanged = ({ sessionCode, roundNumber, roundId, totalRounds }) => {

            console.log(`session ${sessionCode}, id: ${roundId}, round: ${roundNumber} out of ${totalRounds}`);
            navigate(`/session/live/${sessionCode}`, {
                state: {
                    sessionCode,
                    gameId,
                    gameName,
                    hostId,
                    roundNumber,
                    roundId,
                    totalRounds,
                }
            });

        }
        socket.on('round-changed', onRoundChanged);

        return () => socket.off('round-changed', onRoundChanged);
    }, [navigate, gameName, gameId, hostId, isHost]);

    //end Round as Host
    const handleEndGame = () => {
        console.log("host is finalizing the game");

        //send message to go to game results page
        socket.emit('finalize-game', { sessionCode } );

    }

    //game ended
    useEffect(() => {

        const handleGameEnded = () => {
            console.log("game has ended, go see final results");
            
            //navigate to EndGamePage
            navigate(`/session/live/${sessionCode}/endGame`);
            
        }

        socket.on('game-finalized', handleGameEnded);
    }, [])


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
                        <p>{pendingFR.length > 0 ? `There are pending free response Questions` 
                        : `No pending free response questions`}</p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={handleFinalizeResults}
                            className={`mt-4 px-4 py-2 rounded ${pendingFR.length > 0 ? 'bg-gray-300' : 'bg-green-900 text-white'}`}
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
            {resultsReady && finalScores && (
                <div className="mt-4 space-y-4">
                    <h2 className="text-xl font-bold">Round {roundNumber} Results</h2>
                    <div>
                        {finalScores.roundScores.map(r => (
                            <div key={r.playerId} className="border rounded p-2">
                                {r.name || r.playerId}: +{r.roundScore}
                            </div>
                        ))}
                    </div>
                    {!lastRound ? (
                    
                    <div>
                        <h2 className="text-xl font-bold mt-6">Game Totals</h2>
                        {finalScores.leaderboard.map(p => (
                            <div key={p.playerId} className="border rounded p-2 flex justify-between">
                                <span>{p.name || p.playerId}</span>
                                <span>{p.total}</span>
                            </div>
                        ))}
                    </div>
                    ) : ( <div> Game Results Next!! </div> 

                    )}
                </div>
            )}
            {resultsReady && isHost && (
                <div className="mt-4">
                    {!lastRound ? (
                        <button
                            className="border border-green-500 rounded"
                            onClick={handleNextRound}>
                            Start Next Round 
                        </button> ) : (
                        <button 
                            className="border border-red rounded"
                            onClick={handleEndGame}>   
                                End Game
                        </button>) } 
                </div> 
                        
            )}



        </div>
    )
}