import { useState } from "react";
import { useLocation } from "react-router-dom";


export default function Lobby() {

    const location = useLocation();
    const gameName = location.state.gameName;
    const joinCode = location.state.sessionCode;
    const hostData = location.state.hostData;
    
    //parsing out hostData
    const userId = hostData.uid;
    const hostName = hostData.displayName;



    const [players, setPlayers] = useState([]);
    
    //console.log("host data:", hostData);


    return(

        <div className="flex flex-col w-full">
            <div className="text-3xl ">
                <p>Trivia Lobby</p>
            </div>
            <div className="mt-3 text-xl space-y-5">
                <p>Host: {hostName  || "YoMamma"}</p>
                <p>Game: {gameName || "unknown"}</p>
                <p className="text-3xl">Join Code: {joinCode}</p>
            </div>
            <div className="mt-3">
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