import { useState, useEffect } from "react";
import socket from "../../main";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function EndGame() {

    const navigate = useNavigate();
    const { state } = useLocation();
    const { sessionCode } = useParams();
    const isHost = Boolean(state?.isHost)
    const [finalScores, setFinalScores] = useState(state?.finalScores || null);

    //debugging finalscores
    useEffect(() => {
        console.log("finalScores", finalScores);
        console.log("leaderboard", finalScores.leaderboard);
    }, [])

    //socket listener for everyone to exist session -> dashboard
    useEffect(() => {
        const handleSessionEnded = () => {
        console.log("session is ending. GoodBye");
                 
            //navigate to dashboard
            navigate('/dashboard');
        }
        
        socket.on('game-ended', handleSessionEnded);

    }, [])
    
    //host handle end session button
    const handleEndSession = () => {
        console.log("Host has ended session");
        socket.emit('end-game', { sessionCode } );
    }
    


    
    return (
        <div>
            <div>
                <div className="flex justify-around w-1/3">
        <div>
          <p>Game: {}</p>
        </div>
        
      </div>

            </div>
            <div>
                {/* Winner: {leaderboard[0]} */}
                <h1>Winner: {finalScores.leaderboard[0].name}</h1>
            </div>
            <div>
                {/* LeaderBoard: Grid */}
                <div>
                        <h2 className="text-xl font-bold mt-6">Game Totals</h2>
                        {finalScores.leaderboard.map(p => (
                            <div key={p.playerId} className="border rounded p-2 flex justify-between">
                                <span>{p.name || p.playerId}</span>
                                <span>{p.total}</span>
                            </div>
                        )) } 
                    </div>

            </div>
            {isHost && (
            <div>
                {/* Host Button: Close Session return everyone to dashboard*/}
                <button onClick={handleEndSession}
                        className="border border-black rounded-sm">
                    End Session
                </button>
            </div>
            )}
        </div>
    )
}