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

        if (!session) return;
            //console.log("session found for", sessionCode, ":", session);
        socket.emit('session-info', {
            sessionCode,
            gameName: session.gameName,
            hostId: session.hostId,
            gameId: session.gameId,
            gameStarted: session.gameStarted,
            currentRound: session.currentRound,
            totalRounds: session.roundIds?.length ?? null,
            currentRoundId: session.roundIds?.[session.currentRound] ?? null,
            currentQuestionIndex: session.currentQuestionIndex ?? 0,
        });
        
    });

    //player sending answer to host
    socket.on("player-answer", (payload, ack) => {
        //console.log("player-answer payload:", payload);
        const { sessionCode, questionId, choiceIndex, choiceText, choice } = payload;
        
        const session = getSession(sessionCode);
        if (!session) return ack?.({ ok: false, error: "no-session" });
        if (!session.hostSocketId) return ack?.({ ok: false, error: "no-host" });

        //checking if player is part of current session:
        const isMember = session.players.some(p => p.id === socket.id);
        if (!isMember) return ack?.({ ok: false, error: "not-in-room" });

        if (questionId && questionId !== session.currentQuestion?.id) {
            return ack?.({ ok: false, error: "stale-question" });
        }

        //rebroadcasting answer submission to Host
        console.log(`player ${socket.id} has submitted ${choiceText} for question ${questionId}`)
        io.to(session.hostSocketId).emit("submit-answer", {
            playerId: socket.id,
            choiceIndex,
            choiceText: choiceText ?? choice,
            sessionCode,
            questionId,
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
        //console.log("server storing question", question);
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
    });

    //finalizing results from host
    socket.on('results-finalized', ({ finalRoundData }) => {
        const { sessionCode, roundIndex, scores } = finalRoundData || {};
        console.log("finalizing round data:", finalRoundData)
        const session = getSession(sessionCode);
        if (!session) return;
        //console.log("final Round Data:", finalRoundData);
        if (socket.id !== session.hostSocketId) return;

        //merge round scores
        upsertRoundTotals(session, roundIndex, scores || []);

        //prepare a compact broadcast for everyone
        const leaderboard = Object.entries(session.currentPlayerScores)
            .map(([playerId, rec]) => ({
                playerId,
                name: rec.name,
                total: rec.total,
                rounds: rec.byRound,
            }))
            .sort((a,b) => b.total - a.total);

        //emit finalized data to all to display
        io.to(sessionCode).emit('round-finalized', {
            sessionCode,
            roundIndex,
            roundScores: scores,
            leaderboard,
        });
    });

    //--------helpers to manage round data ---------
    
    //updating total scores from new round data
    function upsertRoundTotals(session, roundIndex, entries) {
        if(!session.currentPlayerScores) session.currentPlayerScores = {};
        if (!session.finalizedRounds) session.finalizedRounds = new Set();

        //idempotency
        if (session.finalizedRounds.has(roundIndex)) {
            console.log("recomputing totals");
            recomputeTotals(session);
            return;
        }

        for (const { playerId, name, roundScore } of entries ) {
            if (!session.currentPlayerScores[playerId]) {
                session.currentPlayerScores[playerId] = {
                    name: name ?? "",
                    total: 0,
                    byRound: {},
                };
            }
            //writing the round score
            session.currentPlayerScores[playerId].byRound[roundIndex] = Number(roundScore) || 0;
        }
        
        recomputeTotals(session);
        session.finalizedRounds.add(roundIndex);
    }

    function recomputeTotals(session) {
        for (const [pid, rec] of Object.entries(session.currentPlayerScores)) {
            const sum = Object.values(rec.byRound || {}).reduce((a,b) => a + (Number(b) || 0), 0);
            rec.total = sum
        }
    }


    //end round
    socket.on('end-round', ({ sessionCode}) =>{
        console.log("user has ended round")
        io.to(sessionCode).emit('round-ended', { sessionCode });
    });

    //next round
    socket.on('next-round', ({ sessionCode }) => {
        const session = getSession(sessionCode);
        if (!session) return;

        if (session.hostSocketId !== socket.id) return;

        //ensure defaults
        session.currentRound = session.currentRound ?? 0;
        session.roundIds = session.roundIds ?? [];

        //advance round info
        session.currentRound += 1;
        session.currentQuestion = null;
        session.currentQuestionIndex = 0;

        const currentRoundId = session.roundIds[session.currentRound] ?? null;
        const totalRounds = session.roundIds.length ?? null;

        console.log("host is starting next round");
        
        io.to(sessionCode).emit('round-changed', {
            sessionCode,
            roundNumber: session.currentRound,
            roundId: currentRoundId,
            totalRounds: totalRounds,
        });
    } );

    //end game
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