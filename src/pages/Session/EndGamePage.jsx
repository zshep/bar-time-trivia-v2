

export default function EndGame() {

    //host handle end session button
    const handleEndSession = () => {
        console.log("session is ending. GoodBye");
        
            
            //navigate to dashboard
            navigate('/session/live/');

            socket.on('game-ended', handleGameEnded);
        }



    
    return (
        <div>
            <p>This is the EndGame page</p>
            <div>
                {/* Winner: {leaderboard[0]} */}
            </div>
            <div>
                {/* LeaderBoard: Grid */}

            </div>
            <div>
                {/* Host Button: Close Session return everyone to dashboard*/}
                <button onClick={handleEndSession}>
                    End Game/Close Session
                </button>
            </div>
        </div>
    )
}