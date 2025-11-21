const sessions = new Map(); // key = sessionCode, value = sessionData object

export function createSession(sessionCode, hostId, hostName, gameName, gameId, hostSocketId) {
  console.log("storing session:", sessionCode, hostId, gameName, gameId, hostSocketId, hostName);
  sessions.set(sessionCode, {
    hostId,
    hostName,
    gameName,
    gameId,
    players: [],
    currentRound: null, //round number
    currendRoundIndex: null,
    currentRoundId: null,
    currentRoundName: null,
    roundIds: null,
    currentQuestion: null,
    currentQuestionIndex: null,
    gameStarted: false,
    hostSocketId,
    currentPlayerScores: {}, // [playerKey] : { name, total, by Round: { [roundIndex]: number}}
    roundHistory: [],
    finalizedRounds: new Set(),
    startedAt: Date.now(),
  });
}

export function deleteSession(sessionCode) {
  sessions.delete(sessionCode);
}

export function getSession(sessionCode) {
  console.log("Getting session:", sessionCode);
  return sessions.get(sessionCode);

}

export function addPlayerToSession(sessionCode, player) {
  const session = sessions.get(sessionCode);
  if (!session) return;

  session.players.push(player);

}

export function findSessionBySocketId(socketId) {
  for (const [sessionCode, session] of sessions.entries()) {
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
  for (const [sessionCode, session] of sessions.entries()) {
    const player = session.players.find(p => p.userId === userId);
    if (player) return { sessionCode, session, player };
  }
  return null;
}

//handle reconnect of dropped player
export function addOrAttachPlayer(sessionCode, { socketId, userId, name }) {
  const session = sessions.get(sessionCode);
  if (!session) return null;

  let player = userId
    ? session.players.find(p => p.userId === userId)
    : session.players.find(p => p.id === socketId);

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
  if (!session) return;
  session.gameStarted = true;
  session.currentRound = 0;
  if (session.currentQuestionIndex == null) session.currentQuestionIndex = -1; // before first question
}

export function setRoundData(sessionCode, roundData) {
  const session = sessions.get(sessionCode);
  if (!session) return;

  //ensure defaults
  session.currentRound = 0;
  session.currentRoundIndex = - 1;
  session.roundIds = [];

  //push all roundIds to session.roundIds 
  roundData.forEach(round => {
    session.roundIds.push(round.id);
  });
  

}

export function nextRound(sessionCode) {
  const session = sessions.get(sessionCode);
  if (!session) return;

  //advance round info
  session.currentRound += 1;
  session.currentQuestion = null;
  session.currentQuestionIndex = 0;

}



export function setCurrentQuestion(sessionCode, questionObj) {
  const session = sessions.get(sessionCode);
  if (!session) return;

  session.currentQuestion = questionObj || null;
}

export function setCurrentQuestionIndex(sessionCode, idx) {
  const session = sessions.get(sessionCode);
  if (!session) return;
  session.currentQuestionIndex = idx;
}

export function getCurrentQuestionIndex(sessionCode) {
  const session = sessions.get(sessionCode);
  if (!session) return;

  return session.currentQuestionIndex;


}

export function nextQuestion(sessionCode) {
  const session = sessions.get(sessionCode);
  if (!session) return;
  if (session.currentQuestionIndex == null) session.currentQuestionIndex = 0;
  else session.currentQuestionIndex += 1;
}

export function setHostSocket(sessionCode, hostSocketId) {
  const session = sessions.get(sessionCode);
  if (!session) return;
  session.hostSocketId = hostSocketId;
}

// debugging
export function _debugListSessionCodes() {
  return Array.from(sessions.keys());
}



