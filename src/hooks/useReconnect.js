import { useEffect } from "react";
import socket from "../main";


export function useReconnect() {
    useEffect(() => {
        const sessionCode = localStorage.getItem("sessionCode");
        const userId = localStorage.getItem("userId");
        const isHost = localStorage.getItem("isHost") === "true";

        console.log(`Attempting to reconnect for session ${sessionCode} for userId ${userId} and isHost is ${isHost}`);

        if (sessionCode && userId) {
            if (isHost) {
                socket.emit("reconnect-host", { sessionCode, userId });
            } else {
                console.log("the player is attempting to reconnect");
                socket.emit("reconnect-player", { sessionCode, userId });
            }
        }
    },[])
}