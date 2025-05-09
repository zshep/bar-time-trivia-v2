import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig";
import socket from "../../main";

export default function JoinTriviaSession() {


    const [joinCode, setJoinCode] = useState("");
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("NOUSER");
    const [gameName, setGameName] = useState("Unknown Game");
    const [hostId, setHostId] = useState("uknown host");
    const navigate = useNavigate();

    //grabbing users data
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log("user: ", user);
                setUserId(user.uid);
                setUserName(user.displayName);

            } else {
                console.log("there is no user");
            }

        });

        return () => unsubscribe();
    }, []);

    // handling socket calls for entering Join Code
    useEffect(() => {
        const handleSessionInfo = ({ gameName, hostId }) => {
            console.log('Received session info:', gameName, hostId);
            setGameName(gameName);
            setHostId(hostId);
        };

        const handleJoinedSuccessfully = ({ sessionCode, gameName, hostId }) => {
            console.log("Joined Successful, navigating to lobby");
            navigate(`/session/lobby/${sessionCode}`, {
                state: {
                    sessionCode,
                    gameName,
                    hostData: {
                        uid: hostId,
                        displayName: userName
                    }
                }
            });

        };

        const handleJoinError = ({ message }) => {
            console.error("Failed to join:", message);
            alert("Failed to join: " + message);

        };
        socket.on('session-info', handleSessionInfo);
        socket.on('joined-successfully', handleJoinedSuccessfully);
        socket.on('join-error', handleJoinError);

        // Clean up on unmount
        return () => {
            socket.off('session-info', handleSessionInfo);
            socket.off('joined-successfully', handleJoinedSuccessfully);
            socket.off('join-error', handleJoinError);
        };

    }, [navigate, userName]);



    const handleSubmitJoinCode = (event) => {
        event.preventDefault();
        console.log("submiting Join Code: ", joinCode);
        console.log("player: ", userName);

        //emiting to socket
        socket.emit('request-session-info', { sessionCode: joinCode })
        socket.emit('join-session', { sessionCode: joinCode, playerName: userName });


    };


    return (
        <div className="flex flex-col w-full mt-20">
            <h1>Join a Trivia Session!</h1>

            <form
                onSubmit={(event) => handleSubmitJoinCode(event)}
                className="mt-3">

                <div className="flex flex-col w-25 justify-self-center ">
                    <label>Enter Join Code</label>
                    <input
                        className="text-center"
                        value={joinCode}
                        type="text"
                        autoFocus={false}
                        placeholder="XXXXXX"
                        onChange={(e) => setJoinCode(e.target.value)}></input>
                </div>
                <button
                    className="mt-3"
                    type="submit"
                >Submit</button>
            </form>
        </div>
    )
}