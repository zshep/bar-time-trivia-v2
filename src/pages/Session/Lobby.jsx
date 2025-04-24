import { useState } from "react";
import { useLocation } from "react-router-dom";


export default function Lobby() {

    const location = useLocation();
    const gameName = location.state.gameName;
    const joinCode = location.state.sessionCode;
    
    const [players, setPlayers] = useState([]);


    return(

        <div className="flex flex-col justify-center">
            <div>
                <p>Trivia Lobby</p>
            </div>
            <div>
                <p>Game: {gameName || "unknown"}</p>
            </div>
            <div>
                    <p>Joined Players</p>
                    <div className="flex flex-row ">

                        {/* players.map((player) => (
                            <div className="flex flex-row border border-black">
                            {player.name}
                            </div>
                        )) */}
                    </div>
            </div>

        </div>
    )
}