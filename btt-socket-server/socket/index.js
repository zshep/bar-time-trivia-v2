import { getSession, deleteSession, createSession, addPlayerToSession, startGame, nextQuestion, addOrAttachPlayer, setHostSocket, setCurrentQuestion } from './sessionStore.js';
import { saveGameResult } from '../firestore/saveGameResult.js';


export function registerSocketHandlers(io, socket) {

    // Host creates a session
    socket.on('create-session', ({ sessionCode, hostId, gameId, gameName }) => {
        console.log(`Session created: ${sessionCode} by host ${hostId} for game ${gameName}`);
        createSession(sessionCode, hostId, gameName, gameId, socket.id);

        socket.join(sessionCode);
        io.to(socket.id).emit('session-created', { sessionCode });

        // sending initial state to host
        socket.emit('player-list-update', { players: [] });

    });

    // Player joins a session
    socket.on('join-session', ({ sessionCode, playerName, userId }) => {
        const session = getSession(sessionCode);
        //console.log("session code:", sessionCode);
        //console.log("session", session);
        //console.log("Player joining: ", playerName)

        if (session) {
            socket.join(sessionCode);
            console.log(`${playerName} with userId: ${userId} joined session ${sessionCode}`);

            //updating in-memory session
            const player = addOrAttachPlayer(sessionCode, {
                socketId: socket.id,
                userId,
                name: playerName,
            });

            //sync for late joiner
            if (session.currentQuestion) {
                socket.emit("new-question", session.currentQuestion);
            }

            io.to(sessionCode).emit('player-list-update', { players: session.players });

            socket.emit('joined-successfully', {
                sessionCode,
                gameName: session.gameName,
                hostId: session.hostId
            });

        } else {
            //session doesn't exist
            socket.emit('join-error', { message: "Session not found" });
            return;
        }


    });

    socket.on('request-player-list', ({ sessionCode }) => {
        const session = getSession(sessionCode);


        if (session) {
            socket.emit('player-list-update', { players: session.players });
        }

    });

    // grab missing data for lobby
    socket.on('request-session-info', ({ sessionCode }) => {
        console.log("Session Info request for session:", sessionCode);

        const session = getSession(sessionCode);

        if (session) {
            console.log("session found for", sessionCode, ":", session);
            socket.emit('session-info', {
                sessionCode,
                gameName: session.gameName,
                hostId: session.hostId,
                gameId: session.gameId,
                gameStarted: session.gameStarted
            });
        } else {
            console.log("session does not exist for sessionCode", sessionCode);
            console.log("current session store keys:", Array.from(session.keys()));
        }
    });

    //player sending answer to host
    socket.on("player-answer", ({ choice, sessionCode, questionId }, ack) => {
        const session = getSession(sessionCode);

        if (!session) return ack?.({ ok: false, error: "no-session" });
        if (!session.hostSocketId) return ack?.({ ok: false, error: "no-host" });

        //checking if player is part of current session:
        const isMember = session.players.some(p => p.id === socket.id);
        if (!isMember) return ack?.({ ok: false, error: "not-in-room" });

        if (questionId && questionId !== session.currentQuestion?.id) {
            return ack?.({ ok: false, error: "stale-question" });
        }

        //rebroadcasting answer submission

        io.to(session.hostSocketId).emit("submit-answer", {
            playerId: socket.id,
            choice,
            sessionCode,
            questionId
        });

        ack?.({ ok: true });
    });


    // Start game
    socket.on('start-game', ({ sessionCode }) => {
        const session = getSession(sessionCode);
        if (!session) return;

        // host-only guard 
        if (session.hostSocketId !== socket.id) return;

        startGame(sessionCode);
        io.to(sessionCode).emit('game-started');
        nextQuestion(sessionCode);
    });

    // Recieve and forward question from Host
    socket.on('send-question', ({ sessionCode, question }) => {
        const session = getSession(sessionCode);

        // guards
        if (!session) return;
        if (session.hostSocketId !== socket.id) return;

        //setting current question
        setCurrentQuestion(sessionCode, question);
        io.to(sessionCode).emit('new-question', question);
    });

    // reconnecting player
    socket.on("reconnect-player", ({ sessionCode, userId, playerName }) => {
        const session = getSession(sessionCode);
        if (!session) return;

        socket.join(sessionCode);
        addOrAttachPlayer(sessionCode, { socketId: socket.id, userId, name: playerName });
        socket.emit("player-list-update", { players: session.players });
        if (session.currentQuestion) socket.emit("new-question", session.currentQuestion);
    });

    //reconnect host
    socket.on("reconnect-host", ({ sessionCode, userId }) => {
        const session = getSession(sessionCode);
        if (session) {
            setHostSocket(sessionCode, socket.id);
            socket.join(sessionCode);

            //push current state to host
            socket.emit("player-list-update", { players: session.players });

            if (session.currentQuestion) {
                socket.emit("new-question", session.currentQuestion);
            }
            io.to(sessionCode).emit("host-status", { connected: true });
        }
    })


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