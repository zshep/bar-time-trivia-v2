import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../main";
import { db, auth } from "../../../app/server/api/firebase/firebaseConfig";
import { getDoc, doc } from "firebase/firestore";

export default function Lobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // ----- State -----
  const [gameName, setGameName] = useState(state.gameName);
  const [gameId, setGameId] = useState(state.gameId);
  const [joinCode, setJoinCode] = useState(state.sessionCode);
  const [hostId, setHostId] = useState(state.hostId);
  const [hostName, setHostName] = useState("");
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountDown] = useState(3);

  // ----- Ref to prevent session spam -----
  const sessionInfoRequestedRef = useRef(false);

  // ----- Firestore lookup -----
  const grabHostData = async (hostId) => {
    try {
      const hostRef = doc(db, "users", hostId);
      const hostSnap = await getDoc(hostRef);
      if (hostSnap.exists()) {
        const hostData = hostSnap.data();
        setHostName(hostData.username || "Unknown Host");
      } else {
        console.warn("No host found in Firestore.");
      }
    } catch (err) {
      console.error("Error fetching host data:", err);
    }
  };

  // ----- Host starts game -----
  const handleStartGame = () => {
    socket.emit("start-game", { sessionCode: joinCode });
  };

  // ----- Countdown & navigation -----
  const handleGameStarted = useCallback(() => {
    console.log("Game has started!");
    setShowCountdown(true);
    let current = 3;
    setCountDown(current);

    const interval = setInterval(() => {
      current--;
      setCountDown(current);

      if (current <= 0) {
        clearInterval(interval);



        if (gameName && gameId && joinCode && hostId) {
          console.log("Navigating to live session.");
          navigate(`/session/live/${joinCode}`, {
            state: { gameName, gameId, sessionCode: joinCode, hostId },
          });
        } else {
          console.warn("Missing session data at end of countdown.");

          if (!sessionInfoRequestedRef.current && joinCode) {
            console.log("Retrying session-info request...");
            socket.emit("request-session-info", { sessionCode: joinCode });
            sessionInfoRequestedRef.current = true;
          }

          setShowCountdown(false);
          setTimeout(() => {
            setCountDown(3);
            setShowCountdown(true);
          }, 1000);
        }
      }
    }, 1000);
  }, [gameName, gameId, joinCode, hostId, navigate]);

  // ----- Get session info if needed -----
  useEffect(() => {
    const handleSessionInfo = ({ gameName, hostId, gameStarted }) => {
      console.log("Received session info:", gameName, hostId, gameStarted);
      setGameName(gameName);
      setHostId(hostId);
      grabHostData(hostId);
      console.log("gameName, HostId", gameName, hostId);

      //deteremining if host or player
      const user = auth.currentUser;
      const isHostUser = user?.uid === hostId;

      if (gameStarted && !isHostUser) {
        console.log("Game has already started and I'm a player — navigating now.");
        navigate(`/session/live/${joinCode}`, {
          state: {
            gameName,
            gameId,
            sessionCode: joinCode,
            hostId,
          },
        });
        console.log("player navigating to live game");
      }

    };

    socket.on("session-info", handleSessionInfo);

    if (!gameName || !hostId) {
      console.log("Requesting session info from server...");
      socket.emit("request-session-info", { sessionCode: joinCode });
    }
    /* else {
     grabHostData(hostId);
   } */

    return () => {
      socket.off("session-info", handleSessionInfo);
    };
  }, [gameName, hostId, joinCode]);

  // ----- Player list sync -----
  useEffect(() => {
    const handlePlayerListUpdate = ({ players }) => {
      console.log("Player list updated:", players);
      setPlayers(players);
    };

    socket.on("player-list-update", handlePlayerListUpdate);
    socket.emit("request-player-list", { sessionCode: joinCode });

    return () => {
      socket.off("player-list-update", handlePlayerListUpdate);
    };
  }, [joinCode]);

  // ----- Host check -----
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && hostId) {
        setIsHost(user.uid === hostId);
      }
    });
    return () => unsubscribe();
  }, [hostId]);

  // ----- Game started event listener -----
  useEffect(() => {
    console.log("Listening for game-started...");
    socket.on("game-started", handleGameStarted);

    return () => {
      console.log("Unsubscribed from game-started");
      socket.off("game-started", handleGameStarted);
    };
  }, [handleGameStarted]);

  // ----- JSX -----
  return (
    <div className="flex flex-col w-full">
      {showCountdown && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-8 rounded shadow-lg text-center">
            <p className="text-2xl font-bold">Get Ready!</p>
            <p className="text-6xl font-extrabold mt-4">
              {countdown > 0 ? countdown : "GO!"}
            </p>
          </div>
        </div>
      )}

      <div className="text-3xl">
        <p>Trivia Lobby</p>
      </div>

      <div className="mt-3 text-xl space-y-5">
        <p>Host: {hostName || "YoMamma"}</p>
        <p>Game: {gameName || "Unknown"}</p>
        <p className="text-3xl">Join Code: {joinCode}</p>
      </div>

      <div className="mt-3">
        <div className="flex flex-col p-3 gap-2">

          <p>Joined Players</p>
          {players.length > 0 ? (players.map((player) => (

            <div key={player.id} className="border border-black p-2">
              {player.name}
            </div>
          ))) : (<p>No Players Have Joined</p>)}
        </div>
      </div>

      {isHost && (
        players.length > 0 ? (

          <button
            onClick={handleStartGame}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-40 place-self-center"
          >
            Start Game
          </button>
        ) : (<p></p>)
      )}
    </div>
  );
}
