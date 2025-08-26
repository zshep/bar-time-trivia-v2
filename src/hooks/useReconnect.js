import { useEffect } from "react";
import socket from "../main";


export function useReconnect() {
    useEffect(() => {
        const sessionCode = localStorage.getItem("sessionCode");
        const userId = localStorage.getItem("userId");
        const isHost = localStorage.getItem("isHost") === "true";

        if (sessionCode && userId) {
            if (isHost) {
                socket.emit("reconnect-host", { sessionCode, userId });
            } else {
                socket.emit("reconnect-player", sessionCode, userId);
            }
        }
    },[])
}