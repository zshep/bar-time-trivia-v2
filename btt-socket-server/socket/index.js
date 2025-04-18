import { getSession, deleteSession } from './sessionStore.js';
import { saveGameResult } from '../firestore/saveGameResult.js';


export function registerSocketHandlers(io, socket){

// Host creates a session
socket.on('create-session', ({ sessionCode, hostName }) => {
    console.log(`Session created: ${sessionCode} by ${hostName}`);
    socket.join(sessionCode);
    io.to(socket.id).emit('session-created', { sessionCode });

});

// Player joins a session
socket.on('join-session', ({ sessionCode, playerName }) => {
    createSocket.join(sessionCode);
    console.log(`${playerName} joined session ${sessionCode}`);
    io.to(sessionCode).emit('player-joined', { playerName });
});

// Start game
socket.on(`start-game`, ({ sessionCode }) => {
    io.to(sessionCode).emit('game-started');
});

// Recieve and forward question
socket.on('send-question', ({ sessionCode, questionData}) => {
    io.to(sessionCode).emit('new-question', questionData);
});

// Handle answer submission
socket.on('submit-answer', ({ sessionCode, playerId, answer }) => {
    console.log(`Answer received from ${playerId}: ${answer}`);

});

socket.on('end-game', async ({ sessionCode }) => {
    const session = getSession(sessionCode);

    if (session) {
        // sumary of data to save
        const finalData = {
            players: session.players,
            totalRounds: session.currentRound,
            gameStartedAt: session.startedAt || null,
            hostId: session.hostId,
            sessionCode
        };
        await saveGameResult(sessionCode, finalData);

        //Notify players
        io.to(sessionCode).emit('game-ended', { message: 'Game Over!'})

        //clean up
        deleteSession(sessionCode);
    }
});

}