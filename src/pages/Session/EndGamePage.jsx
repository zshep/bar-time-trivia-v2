import { useState, useEffect } from "react";
import socket from "../../main";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
        console.log("finalScores", finalScores);
        console.log("leaderboard", finalScores.leaderboard);
    }, [])

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
        </div>
    )
}