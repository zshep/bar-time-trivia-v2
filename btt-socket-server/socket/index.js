import { getSession, deleteSession, createSession, addPlayerToSession } from './sessionStore.js';
import { saveGameResult } from '../firestore/saveGameResult.js';


export function registerSocketHandlers(io, socket) {

    // Host creates a session
    socket.on('create-session', ({ sessionCode, hostId, gameName }) => {
        console.log(`Session created: ${sessionCode} by host ${hostId} for game ${gameName}`);
        createSession(sessionCode, hostId, gameName);
        socket.join(sessionCode);
        io.to(socket.id).emit('session-created', { sessionCode });

    });

    // Player joins a session
    socket.on('join-session', ({ sessionCode, playerName }) => {
        const session = getSession(sessionCode);
        //console.log("session code:", sessionCode);
        //console.log("session", session);
        //console.log("Player joining: ", playerName)

        if (session) {
            socket.join(sessionCode);
            console.log(`${playerName} joined session ${sessionCode}`);

            //updating in-memory session
            addPlayerToSession(sessionCode, {
                id: socket.id,
                name: playerName
            });

            io.to(sessionCode).emit('player-list-update', { players: session.players });
    
            socket.emit('joined-successfully', {
                sessionCode,
                gameName: session.gameName,
                hostId: session.hostId 
        });
        
        } else {
            //session doesn't exist
            socket.emit('join-error', { message: "Session not found"});
        }


    });

    socket.on('request-player-list', ({ sessionCode }) =>{
        const session = getSession( sessionCode );


        if (session) {
            socket.emit('player-list-update', { players: session.players });
        }

    });

    // grab missing data for lobby
    socket.on('request-session-info', ({ sessionCode }) => {
        const session = getSession(sessionCode);

        if (session) {
            socket.emit('session-info', {
                sessionCode,
                gameName: session.gameName,
                hostId: session.hostId
            });
        } else {
            console.log("session does not exist");
        }
    });


    // Start game
    socket.on(`start-game`, ({ sessionCode }) => {
        io.to(sessionCode).emit('game-started');
    });

    // Recieve and forward question
    socket.on('send-question', ({ sessionCode, questionData }) => {
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
            io.to(sessionCode).emit('game-ended', { message: 'Game Over!' })

            //clean up
            deleteSession(sessionCode);
        }
    });

}