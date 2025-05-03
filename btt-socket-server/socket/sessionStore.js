const sessions = new Map(); // key = sessionCode, value = sessionData object

export function createSession(sessionCode, hostId, gameName, gameId) {
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
    return sessions.get(sessionCode);

}

export function addPlayerToSession(sessionCode, player){
    const session =sessions.get(sessionCode);
    if (session) {
        session.players.push(player);
    }
}

export function startGame(sessionCode) {
    const session =sessions.get(sessionCode);
    if (session) {
        session.gameStarted = true;
    }
}

export function deleteSession(sessionCode) {
    sessions.delete(sessionCode);
}