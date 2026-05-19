import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

export default function Spectator() {
  const [joinCode, setJoinCode] = useState("");
  const [userId, setUserId] = useState("watcher1");
  const [userName, setUserName] = useState("spectator");
  const [gameName, setGameName] = useState("Unknown Game");
  const [hostId, setHostId] = useState("uknown host");
  const [hostName, setHostName] = useState("Unknown");
  const navigate = useNavigate();

  // handling socket calls for entering Join Code
  useEffect(() => {
    const handleSessionInfo = ({ gameName, hostId, hostName }) => {
      console.log("Received session info:", gameName, hostId);
      setGameName(gameName);
      setHostId(hostId);
      setHostName(hostName);
    };

    const handleJoinedSuccessfully = ({
      sessionCode,
      gameName,
      hostId,
      hostName,
    }) => {
      console.log("Joined Successful, navigating to lobby");

      //local storage for reconnect helper
      localStorage.setItem("sessionCode", sessionCode);
      if (userId) localStorage.setItem("userId", userId);
      localStorage.setItem("isHost", "false");
      localStorage.setItem("isSpectator", "true");

      navigate(`/session/lobby/${sessionCode}`, {
        state: {
          sessionCode,
          gameName,
          hostId,
          hostName: hostName,
        },
      });
    };

    const handleJoinError = ({ message }) => {
      console.error("Failed to join:", message);
      alert("Failed to join: " + message);
    };
    socket.on("session-info", handleSessionInfo);
    socket.on("joined-successfully", handleJoinedSuccessfully);
    socket.on("join-error", handleJoinError);

    // Clean up on unmount
    return () => {
      socket.off("session-info", handleSessionInfo);
      socket.off("joined-successfully", handleJoinedSuccessfully);
      socket.off("join-error", handleJoinError);
    };
  }, [navigate, userName]);

  //submit join code handler:
  const handleSubmitJoinCode = (event) => {
    event.preventDefault();
    console.log("submiting Join Code: ", joinCode);

    //emiting to socket
    socket.emit("request-session-info", { sessionCode: joinCode });
    socket.emit("join-session-spectator", {
      sessionCode: joinCode,
      userId,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome Spectator: Join Trivia Session
        </h1>
        <p className="text-sm text-gray-600">
          Enter the join code provided by the host.
        </p>
      </div>

      {/* Card */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form
          onSubmit={(event) => handleSubmitJoinCode(event)}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Join code
            </label>

            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={joinCode}
              type="text"
              autoFocus={false}
              placeholder="XXXXXX"
              onChange={(e) => setJoinCode(e.target.value)}
            />
          </div>

          <button
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
            type="submit"
          >
            Join Session
          </button>
        </form>
      </div>
    </div>
  );
}
