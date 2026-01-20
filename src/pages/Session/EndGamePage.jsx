import { useState, useEffect } from "react";
import socket from "../../main";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toCSV } from "../../utils/csv";

export default function EndGame() {

    const navigate = useNavigate();
    const { state } = useLocation();
    const { sessionCode } = useParams();
    const isHost = Boolean(state?.isHost);
    const [gameName, setGameName] = useState("No Game Name");
    const [finalScores, setFinalScores] = useState(state?.finalScores || null);

    //grabbing session info
    useEffect(() => {

        socket.emit('request-session-info', { sessionCode });

        const handleSessionInfo = ({ gameName }) => {
            if (!gameName) {
                console.log("there's no gameName")
                return;
            }

            //console.log("we have the gameName", gameName);
            setGameName(gameName);
        }

        socket.on('session-info', handleSessionInfo);
        return () => socket.off('session-info', handleSessionInfo);
    }, [sessionCode])

    //debugging finalscores
    useEffect(() => {
        if (!finalScores) return;
        console.log("finalScores", finalScores);
        console.log("leaderboard", finalScores.leaderboard);
    }, [finalScores])

    //host handle end session button
    const handleEndSession = () => {
        console.log("Host has ended session");
        socket.emit('end-game', { sessionCode });
    }


    //socket listener for everyone to exist session -> dashboard
    useEffect(() => {
        const handleSessionEnded = () => {
            console.log("session is ending. GoodBye");

            //navigate to dashboard
            navigate('/dashboard');
        }

        socket.on('game-ended', handleSessionEnded);

    }, [])

    //leaderboard headers for csv download
    const headers = [
        "group_name",
        "game_name",
        "player_name",
        "total_points",
        "accuracy_percent",
        "questions_answered",
        "questions_correct",
        "rounds_played",
    ];

    const rows = (finalScores?.leaderboard || []).map(p => {
        const questionsAnswered = p.questionsAnswered ?? 0;
        const questionsCorrect = p.questionsCorrect ?? 0;

        const accuracy =
            questionsAnswered > 0
                ? Math.round((questionsCorrect / questionsAnswered) * 1000) / 10
                : 0;

        return {
            group_name: "",                 // field to fill in later
            game_name: gameName || "",
            player_name: p.name || "",
            total_points: p.total ?? 0,
            accuracy_percent: accuracy,
            questions_answered: questionsAnswered,
            questions_correct: questionsCorrect,
            rounds_played: p.roundsPlayed ?? "", // optional / safe default
        };
    });

    //downloading csv
    function downloadLeaderboardCSV() {
        if(!finalScores?.leaderboard?.length) return;

        const csv = toCSV(headers, rows);
        const blob = new Blob([csv], { type: "text/csv"});
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `btt-leaderboard_${gameName || "game"}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
    }





    return (
        <div className="w-full">
  <div className="mx-auto w-full max-w-4xl px-4 py-6">
    {/* Header */}
    <div className="flex flex-col items-center text-center gap-2">
      <h1 className="text-2xl font-bold text-gray-900">Game Results</h1>
      <p className="text-sm text-gray-700">
        <span className="font-semibold text-gray-900">Game:</span> {gameName}
      </p>
    </div>

    {/* Winner */}
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Winner
      </p>
      <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
        {finalScores.leaderboard[0].name}
      </h2>
    </div>

    {/* Totals */}
    <div className="mt-6 rounded-lg   p-6 shadow-sm">
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

    {/* Host actions */}
    {isHost && (
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={handleEndSession}
          className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
          type="button"
        >
          End Session
        </button>

        <button
          onClick={downloadLeaderboardCSV}
          className="rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800 transition"
          type="button"
        >
          Download Leaderboard CSV
        </button>
      </div>
    )}
  </div>
</div>
    )
}