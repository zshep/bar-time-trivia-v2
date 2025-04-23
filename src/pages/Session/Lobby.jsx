import { useState } from "react";


export default function Lobby() {

    const [players, setPlayers] = useState([]);


    return(

        <div className="flex flex-col justify-center">
            <div>
                <p>Trivia Lobby</p>
            </div>
            <div>
                <p>Game: {game.name || "unknown"}</p>
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