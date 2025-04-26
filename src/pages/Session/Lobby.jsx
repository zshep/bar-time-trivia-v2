import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import socket from "../../main";

export default function Lobby() {

    const location = useLocation();
    const gameName = location.state.gameName;
    const joinCode = location.state.sessionCode;
    const hostData = location.state.hostData;
    
    //parsing out hostData
    const userId = hostData.uid;
    const hostName = hostData.displayName;

    useEffect(() => {

        //listening for updates to players list
        socket.on('player-list-update', ({ players }) => {
            console.log("recieved updated players list: ", players);
            setPlayers(players);
        });
        
        //cleaning up socket listiner when component unmounts
        return () => {
            socket.off('player-list-update');
        };

    }, [])



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
                    <div className="flex flex-col border p-3 gap-2">

                        {   players.map((player) => (
                            <div 
                                key={player.id}
                                className="border border-black p-2">
                            {player.name}
                            </div>
                        )) }
                    </div>
            </div>

        </div>
    )
}