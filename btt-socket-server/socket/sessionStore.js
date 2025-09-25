import { Underline } from "lucide-react";

const sessions = new Map(); // key = sessionCode, value = sessionData object

export function createSession(sessionCode, hostId, gameName, gameId, hostSocketId) {
    console.log("storing session:", sessionCode, hostId, gameName, gameId, hostSocketId);
    sessions.set(sessionCode, {
        hostId,
        gameName,
        gameId,
        players: [{ id: Socket.id, userId, userName }],
        currentRound: 1,
        currentQuestion: 0,
        gameStarted: false,
        hostSocketId
    });
}

export function getSession(sessionCode) {
    console.log("Gettings session:", sessionCode);
    return sessions.get(sessionCode);

}

export function addPlayerToSession(sessionCode, player) {
    const session = sessions.get(sessionCode);
    if (session) {
        session.players.push(player);
    }

}

export function findSessionBySocketId() {
    for (const [sessionCode, session] of session.entries()) {
        const player = session.players.find(p => p.id === socketId);
        if (player) {
            return { sessionCode, session, player };
        }
        if (session.hostSocketId === socketId) return { sessionCode, session, player: null, isHost: true }
    }

    console.log("session and or player not found");
    return null; //not found
}

export function findSessionByUserId(userId) {
    for (const [sessionCode, session] of session.entries()) {
        const player = session.players.find(p => p.userId === userId);
        if (player) return { sessionCode, session, player };
    }
    return null;
}

//handle reconnect of dropped player
export function addOrAttachPlayer(sessionCode, { socketId, userId, name }) {
    const session = sessions.get(sessionCode);
    if (!session) return null;

    let player = session.players.find(p => p.userId === userId);

    if (player) {

        // reattach
        if (player.disconnectTimerId) {
            clearTimeout(player.disconnectTimerId);
            player.disconnectTimerId = undefined;
        }
        player.id = socketId;
        player.connected = true;
    } else {
        // first time joining for this userId
        player = { id: socketId, userId, name, connected: true };
        session.players.push(player);
    }
    return player;
}

// removing player
export function removePlayerFromSession(sessionCode, socketId) {
  const session = sessions.get(sessionCode);
  if (!session) return;

  session.players = session.players.filter(p => p.id !== socketId);
}

// Mark player as disconnected with optional grace timer
export function markDisconnected(socketId, { graceMs = 120_000 } = {}) {
  const found = findSessionBySocketId(socketId);
  if (!found) return null;
  const { sessionCode, session, player, isHost } = found;

  if (isHost) {
   
    session.hostSocketId = null;
    return { sessionCode, session, player: null, isHost: true };
  }

  if (!player) return null;

  player.connected = false;

  // start grace timer to remove if they don't come back
  player.disconnectTimerId = setTimeout(() => {
    removePlayerFromSession(sessionCode, socketId);
  }, graceMs);

  return { sessionCode, session, player };
}



export function startGame(sessionCode) {
    const session = sessions.get(sessionCode);
    if (session) {
        session.gameStarted = true;
        console.log("The game has started");
    }
}

//update current question:
export function nextQuestion(sessionCode) {
    const session = sessions.get(sessionCode);
    if (session) {
        session.question = session.question + 1
    }
}

export function setCurrentQuestion(sessionCode, questionObj) {
  const session = sessions.get(sessionCode);
  if (session) session.currentQuestion = questionObj || null;
}

export function setHostSocket(sessionCode, hostSocketId) {
  const session = sessions.get(sessionCode);
  if (session) session.hostSocketId = hostSocketId;
}



export function deleteSession(sessionCode) {
    sessions.delete(sessionCode);
}