import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../main";
import { db, auth } from "../../../app/server/api/firebase/firebaseConfig";
import {
  getDoc,
  getDocs,
  doc,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useReconnect } from "../../hooks/useReconnect";

export default function Lobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // ----- State -----
  const [gameName, setGameName] = useState(state.gameName);
  const [gameId, setGameId] = useState(state.gameId);
  const [joinCode, setJoinCode] = useState(state.sessionCode);
  const [hostId, setHostId] = useState(state.hostId ?? null);
  const [hostName, setHostName] = useState(state.hostName ?? "");
  const [roundData, setRoundData] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountDown] = useState(3);
  const [userId, setUserId] = useState("");

  // ----- Ref to prevent session spam -----
  const sessionInfoRequestedRef = useRef(false);
  useReconnect();

  // ----- Firestore lookup for host -----
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

  //-----------firestore look up for round data-----------

  useEffect(() => {
    if (!gameId || !isHost) {
      console.log("gameId and host", gameId, isHost);
      return;
    }
    console.log("am I the host?", isHost);

    const fetchRounds = async () => {
      try {
        const col = collection(db, "rounds");
        const q = query(
          col,
          where("gameId", "==", gameId),
          orderBy("roundNumber", "asc"),
        );
        const snap = await getDocs(q);
        const rounds = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRoundData(rounds);
        //set round specific data???
        console.log("emitting round data:", rounds);
        socket.emit("store-roundData", {
          sessionCode: joinCode,
          roundData: rounds,
        });
      } catch (err) {
        console.error("Error fetching rounds:", err);
      }
    };

    fetchRounds();
  }, [gameId, isHost]);

  //grab host id if host
  useEffect(() => {
    if (hostId && !hostName) {
      console.log("lookingfor host info");
      grabHostData(hostId);
    }
  }, [hostName, hostId]);

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
    const handleSessionInfo = ({
      gameName,
      hostId,
      hostName,
      gameId,
      gameStarted,
    }) => {
      console.log("Received session info:", gameName, hostId, gameStarted);
      setGameName(gameName);
      setHostId(hostId);
      setGameId(gameId);
      setHostName(hostName);
      console.log("gameName, HostId", gameName, hostId);

      //deteremining if host or player
      const user = auth.currentUser;
      const isHostUser = user?.uid === hostId;

      if (gameStarted && !isHostUser) {
        console.log(
          "Game has already started and I'm a player — navigating now.",
        );
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

    return () => {
      socket.off("session-info", handleSessionInfo);
    };
  }, [gameName, hostId, joinCode, navigate]);

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
      setUserId(user.uid || "");

      if (user?.uid && hostId) {
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

  // save data to local store for reconnect issues
  useEffect(() => {
    if (!joinCode || !userId) return;
    localStorage.setItem("sessionCode", joinCode);
    localStorage.setItem("userId", userId);
    localStorage.setItem("isHost", isHost);
  }, [joinCode, userId, isHost]);

  return (
    <div className="w-full">
      {/* Countdown overlay */}
      {showCountdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-xl">
            <p className="text-2xl font-bold text-gray-900">Get Ready!</p>
            <p className="mt-4 text-6xl font-extrabold text-gray-900">
              {countdown > 0 ? countdown : "GO!"}
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Trivia Lobby</h1>
        </div>

        {/* Lobby info */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-md font-semibold uppercase tracking-wide text-gray-500">
                Host
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {hostName || "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-md font-semibold uppercase tracking-wide text-gray-500">
                Game
              </p>
              <p className="mt-1 text-md font-semibold text-gray-900">
                {gameName || "Unknown"}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Join code
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-widest text-gray-900">
                {joinCode}
              </p>
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-row justify-center gap-1 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Joined Players: {players.length}
            </h2>
           
          </div>

          <div className="mt-4">
            {players.length > 0 ? (
              <div className="mt-4 flex flex-col items-center gap-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="rw-full max-w-xs text-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900"
                  >
                    {player.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 italic">
                No players have joined yet.
              </p>
            )}
          </div>
        </div>

        {/* Host controls */}
        {isHost && players.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleStartGame}
              className="inline-flex w-fit items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              type="button"
            >
              Start Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
