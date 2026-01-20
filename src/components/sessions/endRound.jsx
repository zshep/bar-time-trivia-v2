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
  const [totalNumberRounds, setTotalNumberRounds] = useState(1);
  const [playersList, setPlayersList] = useState([]);
  const [resultsReady, setResultsReady] = useState(false);
  const [frDecisions, setFrDecisions] = useState({}); // {[qid]: {[pid] : true|false} }
  const [frModalOpen, setFrModalOpen] = useState(false);
  const [frCursor, setFrCursor] = useState(0);
  const [finalScores, setFinalScores] = useState(null);
  const [gameScores, setGameScores] = useState(null);
  const [frozenHostScores, setFrozenHostScores] = useState(null);
  const [lastRound, setLastRound] = useState(false);

  // grabbing session info to navigate to next round
  useEffect(() => {
    if (!gameId || !gameName || !hostId) {
      socket.emit("request-session-info", { sessionCode });
    }

    const handleSessionInfo = ({
      gameName,
      gameId,
      hostId,
      currentRound,
      totalRounds,
    }) => {
      console.log("grabbing session Info from server");
      setGameName(gameName);
      setGameId(gameId);
      setHostId(hostId);
      setTotalNumberRounds(totalRounds);

      if (typeof currentRound === "number") {
        setRoundNumber(currentRound + 1);
      }
    };

    socket.on("session-info", handleSessionInfo);

    return () => socket.off("session-info", handleSessionInfo);
  }, [sessionCode]);

  //checking if this is the last round
  useEffect(() => {
    console.log("roundNumber: ", roundNumber);
    console.log("totalNumberRounds", totalNumberRounds);

    const isLast = roundNumber === totalNumberRounds && totalNumberRounds > 0;
    setLastRound(isLast);
    console.log(
      `EndRound display: ${roundNumber} of ${totalNumberRounds}, last? ${isLast}`
    );

    if (isLast) {
      console.log("this is last round");
    }
  }, [isHost, roundNumber, totalNumberRounds]);

  // normalize answers for easier comparrison
  function norm(s) {
    return String(s ?? "")
      .trim()
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  // Build a list of FR items that need host review
  const pendingFR = useMemo(() => {
    const list = [];
    for (const [qid, payload] of Object.entries(roundAnswers || {})) {
      const { question, answersByPlayer } = payload || {};
      if (!question || question.type !== "freeResponse" || !answersByPlayer)
        continue;

      const correctText = norm(question.correctText);
      for (const [pId, ans] of Object.entries(answersByPlayer)) {
        const playerText = norm(ans?.text);
        const autoMatch =
          correctText && playerText && correctText === playerText;

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
    // close modal automatically when nothing is pending
    if (pendingFR.length === 0) {
      setFrModalOpen(false);
      setFrCursor(0);
    } else {
      // keep cursor in range if list shrinks
      setFrCursor((idx) => Math.min(idx, pendingFR.length - 1));
    }
  }, [pendingFR.length]);

  // Host actions for FR decisions
  function setDecisionFor(qid, pId, value /* true|false */) {
    setFrDecisions((prev) => ({
      ...prev,
      [qid]: { ...(prev[qid] || {}), [pId]: value },
    }));
    // advance -> not needed
    /*setFrCursor((i) => (i + 1 < pendingFR.length ? i + 1 : 0)); */
  }

  //Review button handler
  function handleReviewFR() {
    if (pendingFR.length > 0) {
      setFrModalOpen(true);
      setFrCursor(0);
    }
  }

  //normalize indexing:
  function buildChoiceIndexMap(choices = []) {
    const map = new Map();
    choices.forEach((c, idx) => {
      const label = typeof c === "string" ? c : c?.label ?? c?.calue ?? c?.text;
      const id =
        typeof c === "object" && c?.id != null ? String(c.id) : undefined;

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

    const out = arr
      .map((v) => {
        if (typeof v === "number") return v;
        if (v == null) return undefined;
        const key = String(v).trim();
        const hit = idxMap.get(key);
        return hit !== undefined ? hit : undefined;
      })
      .filter((i) => i !== undefined);

    return out;
  }

  //fallback when a player's answer came as labels/text
  function toIndexArrayFromText(raw, question) {
    if (raw == null) return [];
    const idxMap = buildChoiceIndexMap(question?.choices || []);
    const arr = Array.isArray(raw) ? raw : [raw];

    return arr
      .map((v) => {
        const key = String(v).trim();
        const hit = idxMap.get(key);
        return hit !== undefined ? hit : undefined;
      })
      .filter((i) => i !== undefined);
  }

  //grabbing round data
  useEffect(() => {
    if (!isHost) return;
    //send socket to grab player list
    socket.emit("request-player-list", { sessionCode });

    //grab list of players
    const handlePlayerListUpdate = ({ players }) => {
      //console.log("our list of players:", players);
      setPlayersList(players || []);
    };

    socket.on("player-list-update", handlePlayerListUpdate);
    return () => {
      socket.off("player-list-update", handlePlayerListUpdate);
    };
  }, [isHost, sessionCode]);

  //socket listener for players endround final results
  useEffect(() => {
    //if (isHost) return;
    const handleFinal = ({
      sessionCode,
      roundIndex,
      roundScores,
      leaderboard,
    }) => {
      //console.log("final results roundSCores:", roundScores);
      console.log("final results leaderboard", leaderboard);
      setFinalScores({ roundIndex, roundScores, leaderboard });
      setGameScores({ leaderboard });
      setResultsReady(true);
    };
    socket.on("round-finalized", handleFinal);
    return () => {
      socket.off("round-finalized", handleFinal);
    };
  }, [sessionCode]);

  //helper to record per- player stats for this round
  function recordPlayerAnswer(tally, pId, { question, ans, correct }) {
    if (!tally[pId]) {
      tally[pId] = {
        score: 0,
        questionsAnswered: 0,
        questionsCorrect: 0,
        detail: [],
      };
    }

    const entry = tally[pId];

    //logging detial for debugging/ future UI
    entry.detail.push({
      qid: question.id || question.qid || undefined,
      type: question.type,
      choiceIndex: ans?.index,
      choiceText: ans?.text,
      correct,
    });

    // always increment  "answered" if they submitted *anything*
    entry.questionsAnswered += 1;

    if (correct === true) {
      entry.questionsCorrect += 1;
      entry.score += question.points ?? 1;
    }
  }

  // scoring logic
  const scores = useMemo(() => {
    const tally = {};
    for (const [qid, payload] of Object.entries(roundAnswers || {})) {
      const { question, answersByPlayer } = payload;

      if (!question || !answersByPlayer) continue;

      for (const [pId, ans] of Object.entries(answersByPlayer || {})) {
        let correct = false;

        if (question.type === "multipleChoice") {
          const correctIdx = normalizeCorrectToIndexes(question);

          const playerIdx = Array.isArray(ans?.index)
            ? ans.index.map(Number)
            : typeof ans?.index === "number"
            ? [Number(ans.index)]
            : toIndexArrayFromText(ans?.text, question);

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

        recordPlayerAnswer(tally, pId, { question, ans, correct });
      }
    }

    return tally;
  }, [roundAnswers, frDecisions]);

  const handleFinalizeResults = () => {
    //freezing current computed scoers to host UI stops being derived
    const frozen = JSON.parse(JSON.stringify(scores));
    setFrozenHostScores(frozen);

    // determine roundIndex
    const roundIdx = (() => {
      // if wanting to send roundIndex
      if (typeof state?.roundIndex === "number") return state.roundIndex;

      if (typeof roundNumber === "number") return roundNumber;

      //fallback
      return 0;
    })();
    //console.log("roundIdx going to server:", roundIdx);

    // set up data to be sent to server
    const roundScores = Object.entries(frozen).map(([pId, v]) => {
      const p = playersList.find((pl) => pl.id === pId) || {};
      const playerId = p.userId ?? p.id ?? pId;
      const name = p.name ?? "";

      const roundScore = Number(v?.score ?? 0);
      const questionsAnswered = v.questionsAnswered ?? 0;
      const questionsCorrect = v.questionsCorrect ?? 0;

      return {
        playerId,
        name,
        roundScore,
        questionsAnswered,
        questionsCorrect,
      };
    });

    //console.log(scores);
    const finalRoundData = {
      sessionCode: sessionCode,
      roundIndex: roundIdx,
      scores: roundScores,
    };

    console.log("emitting round data:", finalRoundData);
    socket.emit("results-finalized", { finalRoundData });
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

  // if the host is reviewing and just finished the last item, finalize
  useEffect(() => {
  if (isHost && frModalOpen && pendingFR.length === 0 && !resultsReady) {
    handleFinalizeResults();
  }
}, [pendingFR.length, isHost, frModalOpen, resultsReady]);

  //next round
  const handleNextRound = () => {
    console.log("host has click next round");
    console.log(
      `hostId: ${hostId}, gameName: ${gameName}, gameId:${gameId}, sessionCode: ${sessionCode}`
    );

    //send socket to next round
    socket.emit("next-round", { sessionCode });
  };

  //next round socket listener
  useEffect(() => {
    const onRoundChanged = ({
      sessionCode,
      roundNumber,
      roundId,
      totalRounds,
    }) => {
      console.log(
        `session ${sessionCode}, id: ${roundId}, round: ${roundNumber} out of ${totalRounds}`
      );
      navigate(`/session/live/${sessionCode}`, {
        state: {
          sessionCode,
          gameId,
          gameName,
          hostId,
          roundNumber,
          roundId,
          totalRounds,
        },
      });
    };
    socket.on("round-changed", onRoundChanged);

    return () => socket.off("round-changed", onRoundChanged);
  }, [navigate, gameName, gameId, hostId, isHost]);

  //end Round as Host
  const handleEndGame = () => {
    console.log("host is finalizing the game");
    console.log("Final Results:", finalScores);

    //send message to go to game results page
    socket.emit("finalize-game", { sessionCode });
  };

  //game ended
  useEffect(() => {
    const handleGameEnded = () => {
      console.log("game has ended, go see final results");
      console.log("finalScores:", finalScores);
      console.log("GameScores:", gameScores);

      //navigate to EndGamePage
      navigate(`/session/live/${sessionCode}/endGame`, {
        state: {
          isHost,
          finalScores,
        },
      });
    };

    socket.on("game-finalized", handleGameEnded);
  }, [finalScores, gameScores]);

  const currentFRItem = pendingFR[frCursor] || null;

  return (
    <div className="w-full">
  <div className="mx-auto w-full max-w-4xl px-4 py-6">
    {/* Header */}
    <div className="flex flex-col items-center text-center gap-2">
      <h1 className="text-2xl font-bold text-gray-900">Round Results</h1>
    </div>

    {/* Player waiting */}
    {!isHost && !resultsReady && (
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-700">Waiting for Host to Finalize Results</p>
      </div>
    )}

    {/* Host finalize / review */}
    {isHost && !resultsReady && (
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-700">
          {pendingFR.length > 0
            ? "There are pending free response questions."
            : "No pending free response questions."}
        </p>

        <div className="mt-4 flex justify-center">
          <button
            onClick={pendingFR.length > 0 ? handleReviewFR : handleFinalizeResults}
            className={[
              "rounded-md px-4 py-2 text-sm font-semibold transition",
              pendingFR.length > 0
                ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                : "bg-green-700 text-white hover:bg-green-800",
            ].join(" ")}
            type="button"
          >
            {pendingFR.length > 0 ? `Review ${pendingFR.length}` : "Finalize Results"}
          </button>
        </div>
      </div>
    )}

    {/* FR review modal */}
    {isHost && frModalOpen && currentFRItem && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900">
            Review Free Response ({frCursor + 1} of {pendingFR.length})
          </h3>

          <div className="mt-4 space-y-2 text-sm text-gray-800">
            <div>
              <span className="font-semibold text-gray-900">Player:</span>{" "}
              {currentFRItem.pId}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Correct Answer:</span>{" "}
              {currentFRItem.correctText}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Player Answer:</span>{" "}
              {currentFRItem.playerText}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-end">
            <button
              onClick={handleCorrectFr}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
              type="button"
            >
              Correct
            </button>

            <button
              onClick={handleIncorrectFr}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              type="button"
            >
              Incorrect
            </button>

            <button
              onClick={() => setFrModalOpen(false)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Results */}
    {resultsReady && finalScores && (
      <div className="mt-6 space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Round {roundNumber} Results
          </h2>

          <div className="mt-4 space-y-2">
            {finalScores.roundScores.map((r) => (
              <div
                key={r.playerId}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-gray-900">
                  {r.name || r.playerId}
                </span>
                <span className="font-semibold text-gray-900">+{r.roundScore}</span>
              </div>
            ))}
          </div>
        </div>

        {!lastRound ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Game Totals</h2>

            <div className="mt-4 space-y-2">
              {finalScores.leaderboard.map((p) => (
                <div
                  key={p.playerId}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-900">
                    {p.name || p.playerId}
                  </span>
                  <span className="font-semibold text-gray-900">{p.total}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Game Results Next!!</p>
          </div>
        )}
      </div>
    )}

    {/* Host next action */}
    {resultsReady && isHost && (
      <div className="mt-6 flex justify-center">
        {!lastRound ? (
          <button
            className="rounded-md bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
            onClick={handleNextRound}
            type="button"
          >
            Start Next Round
          </button>
        ) : (
          <button
            className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            onClick={handleEndGame}
            type="button"
          >
            End Game
          </button>
        )}
      </div>
    )}
  </div>
</div>

  );
}
