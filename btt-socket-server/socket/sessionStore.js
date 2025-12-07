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
    currentRoundId: null,
    currentRoundName: null,
    roundIds: null,
    currentQuestion: null,
    gameStarted: false,
    hostSocketId,
    currentPlayerScores: {}, // [playerKey] : { name, total, by Round: { [roundIndex]: number}}
    questionsAnsweredByPlayer: {}, //[playerKey]: int
    questionsCorrectByPlayer: {}, //[playerKey]: int
    roundsPlayedByPlayer: {},
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
    const playerKey = userId || socketId; 
    player = { 
        id: socketId, 
        userId, 
        name,
        playerKey, 
        connected: true 
      };
    
      session.players.push(player);

  }

  if (!player.playerKey) {
    player.playerKey = player.userId || player.id;
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
   if (session.currentRound == null) session.currentRound = 0;
  if (session.currentQuestionIndex == null) session.currentQuestionIndex = -1; // before first question
}

export function setRoundData(sessionCode, roundData) {
  const session = sessions.get(sessionCode);
  if (!session) return;

  //push all roundIds to session.roundIds 
  session.roundIds = roundData.map(r => r.id);

  if (session.currentRound == null) {
    session.currentRound = 0;
  }

  session.currentQuestionIndex = -1;  

}

export function nextRound(sessionCode) {
  const session = sessions.get(sessionCode);
  if (!session) return;

  //advance round info
  session.currentRound += 1;
  session.currentQuestion = null;
  session.currentQuestionIndex = -1;

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

export function recordPlayerAnswer( sessionCode, playerKey, { isCorrect, points}) {
  const session = sessions.get(sessionCode);
  if (!session) return;

  //-------scores -------
  if (!session.currentPlayerScores[playerKey]) {
    session.currentPlayerScores[playerKey] = {
      name: null,
      total: 0,
      byRound: {}, // roundIndex -> points
    };
  }

  const scoreObj = session.currentPlayerScores[playerKey];
  const roundIndex = session.currentRound ?? 0;

  //update total points
  if (typeof points === 'number') {
    scoreObj.total += points;
    scoreObj.byRound[roundIndex] = (scoreObj.byRound[roundIndex] || 0) + points;
  } 

  session.questionsAnsweredByPlayer[playerKey] =
    (session.questionsAnsweredByPlayer[playerKey] || 0) + 1;

    if (isCorrect) {
      session.questionsCorrectByPlayer[playerKey] =
        (session.questionsCorrectByPlayer[playerKey] || 0 ) + 1;
    }
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



