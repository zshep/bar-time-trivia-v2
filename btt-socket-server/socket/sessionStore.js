const sessions = new Map(); // key = sessionCode, value = sessionData object

export function createSession(sessionCode, hostId, gameName, gameId, hostSocketId) {
    console.log("storing session:", sessionCode, hostId, gameName, gameId, hostSocketId);
    sessions.set(sessionCode, {
        hostId,
        gameName,
        gameId,
        players: [],
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
        console.log("The game has started");
    }
}

//update current question:
export function nextQuestion(sessionCode) {
    const session =sessions.get(sessionCode);
    if(session) {
        session.question = session.question + 1
    }
}


export function deleteSession(sessionCode) {
    sessions.delete(sessionCode);
}