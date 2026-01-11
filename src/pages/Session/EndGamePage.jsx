import { useState, useEffect } from "react";
import socket from "../../main";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toCSV } from "../utils/csv";

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
        <div className="justify-center">
            <div className="flex justify-center text-2xl mt-1">
                <p>Game: {gameName}</p>
            </div>
            <div>
                {/* Winner: {leaderboard[0]} */}
                <h4 className="text-3xl mt-6">Winner: {finalScores.leaderboard[0].name}</h4>
            </div>
            <div>
                {/* LeaderBoard: Grid */}
                <div>
                    <h2 className="text-xl font-bold mt-8">Game Totals</h2>
                    {finalScores.leaderboard.map(p => (
                        <div key={p.playerId} className="border rounded border-black p-2 flex justify-between mt-3">
                            <span>{p.name || p.playerId}</span>
                            <span>{p.total}</span>
                        </div>
                    ))}
                </div>

            </div>
            {isHost && (
                <div>
                    {/* Host Button: Close Session return everyone to dashboard*/}
                    <button onClick={handleEndSession}
                        className="border border-black rounded-md mt-5">
                        End Session
                    </button>
                </div>
            )}
            {isHost && (
                <button
                    onClick={downloadLeaderboardCSV}
                    className="mt-4 px-4 py-2 bg-green-700 text-white rounded"
                >
                    DownLoad LeaderBoard CSV
                </button>
            )}
        </div>
    )
}