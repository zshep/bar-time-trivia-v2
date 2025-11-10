import socket from "../main";

export function safeEmit(event, payload) {
    if (!payload?.sessionCode) {
        console.warn(`[safeEmit] missing sessionCode for even "${event}". Payload:`, payload);
        return;
    }
    socket.emit(event, payload);

}