const sessions = new Map(); // key = sessionCode, value = sessionData object

export function createSession(sessionCode, hostId, gameName, gameId) {
    console.log("storing session:", sessionCode, hostId, gameName, gameId);
    sessions.set(sessionCode, {
        hostId,
        gameName,
        gameId,
        players: [],
        currentRound: 1,
        currentQuestion: 0,
        gameStarted: false
     });
}

export function getSession(sessionCode) {
    console.log("Gettings session:", sessionCode);
    return sessions.get(sessionCode);

}

export function addPlayerToSession(sessionCode, player){
    const session =sessions.get(sessionCode);
    if (session) {
        session.players.push(player);
    }
}

export function startGame(sessionCode) {
  const session = sessions.get(sessionCode);
  if (session) {
    console.log("BEFORE setting gameStarted:", session.gameStarted);
    session.gameStarted = true;
    console.log("AFTER setting gameStarted:", session.gameStarted);

    // Double-check what the map has stored
    const reread = sessions.get(sessionCode);
    console.log("Re-read from Map:", reread.gameStarted);
  } else {
    console.warn("Tried to start game for non-existent session:", sessionCode);
  }
}

/*
export function startGame(sessionCode) {
    const session =sessions.get(sessionCode);
    if (session) {
        session.gameStarted = true;
    }
}
*/

export function deleteSession(sessionCode) {
    sessions.delete(sessionCode);
}