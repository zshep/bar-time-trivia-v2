import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig";
import socket from "../../main";

export default function JoinTriviaSession() {

    
    const [joinCode, setJoinCode] = useState("");
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("NOUSER")
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

    const handleSubmitJoinCode = (event) => {
        event.preventDefault();
        console.log("submiting Join Code: ", joinCode);

        //emit join code via socket
        socket.emit('join-session', { sessionCode: joinCode, playerName: userName});

        //if successful
        socket.once('joined-successfully', ({ sessionCode }) => {
            console.log("Joined Successful, navigating to lobby");
            navigate(`/session/lobby/${sessionCode}`)
        });

        //if fail
        socket.once('join-error', ( {message}) => {
            console.error("Failed to join:", message);
            alert("Failed to join: " + message);
        });


        
    }


    return (
        <div className="flex flex-col w-full mt-20">
            <h1>Join a Trivia Session!</h1>

            <form
                onSubmit={(event) => handleSubmitJoinCode(event)}
                className="mt-3">
                
                <div className="flex flex-col w-25 justify-self-center ">
                    <label>Enter Join Code</label>
                    <input
                        className ="text-center"
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