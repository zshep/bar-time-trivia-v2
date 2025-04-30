import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../main";
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { auth } from "../../../app/server/api/firebase/firebaseConfig";

export default function Lobby() {

    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    const [gameName, setGameName] = useState(location.state.gameName);
    const [joinCode, setJoinCode] = useState(location.state.sessionCode);
    const [hostId, setHostId] = useState(location.state.hostId);
    const [hostName, setHostName] = useState("");
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);

    // grabing host data
    const grabHostData = async (hostId) => {
        console.log("hostId:", hostId);

        const hostIdRef = doc(db, "users", hostId);
        const hostIdDoc = await getDoc(hostIdRef)

        if (hostIdDoc.exists()) {
            const hostData = hostIdDoc.data();
            console.log("host data:", hostData);
            setHostName(hostData.username || "unknown Host");

        } else {
            console.log("No host found in firestore");
        }
    };

    //start game logic
    const handleStartGame = () => {
        socket.emit('start-game', { sessionCode: joinCode });

    };



    useEffect(() => {

        //console.log("The state:", state);

        if (!gameName || !hostId) {
            console.log("Requesting session info from server...");
            socket.emit('request-session-info', { sessionCode: joinCode });

            socket.on('session-info', ({ gameName, hostId }) => {
                console.log('Received session info:', gameName, hostId);
                // setting local state with new info:
                setHostId(hostId);
                grabHostData(hostId);

            });
        }

        grabHostData(hostId);

        const handlePlayerListUpdate = ({ players }) => {
            console.log("recieved updated players list: ", players);
            setPlayers(players);
            console.log("players", players);

        }


        //listening for updates to players list
        socket.on('player-list-update', handlePlayerListUpdate);
        socket.emit('request-player-list', { sessionCode: joinCode });


        //cleaning up socket listiner when component unmounts
        return () => {
            socket.off('player-list-update', handlePlayerListUpdate);
        };

        

    }, []);

    //checking if user is host or not
    useEffect(() => {
        const unsubscripe = auth.onAuthStateChanged((user) => {
            if (user && hostId) {
                setIsHost(user.uid === hostId);
            }
        });
        return () => unsubscripe();
    }, [hostId])

    // setting up socket handlers for starting game
    useEffect(() => {
        const handleGameStarted = () => {
            console.log("Game has started!");
            // navigate to gameplay screen
            navigate(`/session/live/${joinCode}`);

        };
        socket.on('game-started', handleGameStarted);

        return () => {
            socket.off('game-started', handleGameStarted);
        }

    }, []);






    return (

        <div className="flex flex-col w-full">
            <div className="text-3xl ">
                <p>Trivia Lobby</p>
            </div>
            <div className="mt-3 text-xl space-y-5">
                <p>Host: {hostName || "YoMamma"}</p>
                <p>Game: {gameName || "unknown"}</p>
                <p className="text-3xl">Join Code: {joinCode}</p>
            </div>
            <div className="mt-3">
                <p>Joined Players</p>
                <div className="flex flex-col border p-3 gap-2">

                    {players.map((player) => (
                        <div
                            key={player.id}
                            className="border border-black p-2">
                            {player.name}
                        </div>
                    ))}
                </div>
            </div>
            {isHost && (
                <button
                    onClick={handleStartGame}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Start Game
                </button>
            )}

        </div>
    )
}