import {
    getSession,
    deleteSession,
    createSession,
    addPlayerToSession,
    startGame,
    nextQuestion,
    addOrAttachPlayer,
    setHostSocket,
    setCurrentQuestion,
    getCurrentQuestionIndex,
    setRoundData,
    nextRound
} from './sessionStore.js';
import { saveGameResult } from '../firestore/saveGameResult.js';
import { adminDb } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';


export function registerSocketHandlers(io, socket) {

    // Host creates a session
    socket.on('create-session', ({ sessionCode, hostId, hostName, gameName, gameId }) => {
        console.log(`Session created: ${sessionCode} by host ${hostName} with id: ${hostId} for game ${gameName}`);
        createSession(sessionCode, hostId, hostName, gameName, gameId, socket.id);

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

        if (!session) {
            socket.emit("join-error", { message: "Session not found" });
            return;
        }

        const player = addOrAttachPlayer(sessionCode, {
            socketId: socket.id,
            userId,
            name: playerName,
        });

        if (!player) {
            socket.emit("join-error", { message: "Could not add player" });
            return;
        }

        socket.join(sessionCode);
        console.log(`${playerName} with userId: ${userId} joined session ${sessionCode}`);


        //sync for late joiner
        if (session.currentQuestion) {
            socket.emit("new-question", session.currentQuestion);
        }

        const safePlayers = session.players.map(p => ({
            id: p.id,
            userId: p.userId,
            name: p.name,
            connected: p.connected,
        }));

        io.to(sessionCode).emit('player-list-update', { players: safePlayers });
        io.to(sessionCode).emit('joined-successfully', {
            sessionCode,
            gameName: session.gameName,
            hostId: session.hostId,
            hostName: session.hostName,
            players: safePlayers,
        });

    });

    socket.on('request-player-list', ({ sessionCode }) => {
        const session = getSession(sessionCode);


        if (session) {
            socket.emit('player-list-update', { players: session.players });
        }

    });

    // grabbing session data/info
    socket.on('request-session-info', ({ sessionCode }) => {
        console.log("Session Info request for session:", sessionCode);

        const session = getSession(sessionCode);

        if (!session) {
            console.log("missing Session");
            socket.emit("join-error", { message: 'Session not found' });
            return;
        }
        //console.log("session found for", sessionCode, ":", session);

        socket.emit('session-info', {
            sessionCode,
            gameName: session.gameName,
            hostId: session.hostId,
            hostName: session.hostName,
            gameId: session.gameId,
            gameStarted: session.gameStarted,
            currentRound: session.currentRound,
            totalRounds: session.roundIds?.length ?? null,
            currentRoundId: session.roundIds?.[session.currentRound] ?? null,
            currentQuestionIndex: session.currentQuestionIndex ?? 0,
        });

    });

    //saving round data to sever
    socket.on('store-roundData', ({ sessionCode, roundData }) => {
        const session = getSession(sessionCode);

        if (!session) return;
        //console.log("recieved roundData from host:", roundData);
        setRoundData(sessionCode, roundData);

    })

    // Start game
    socket.on('start-game', ({ sessionCode }) => {
        const session = getSession(sessionCode);
        if (!session) return;

        // host-only guard 
        if (session.hostSocketId !== socket.id) return;

        console.log("Game is starting for session:", sessionCode)
        startGame(sessionCode);
        //nextRound(sessionCode);

        const idx = getCurrentQuestionIndex(sessionCode);
        console.log("current Question index:", idx);


        io.to(sessionCode).emit('game-started');
        nextQuestion(sessionCode);
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
    socket.on("reconnect-player", ({ sessionCode, userId }) => {
        console.log(`reconnect-player from ${socket.id} for userId: ${userId} to session: ${sessionCode}`)

        const session = getSession(sessionCode);
        if (!session) {
            socket.emit('reconnect-failed', { reason: "session-not-found" });
            return;
        }

        //console.log("Players BEFORE reconnect:", JSON.stringify(session.players, null, 2));

        const player = addOrAttachPlayer(sessionCode, {
            socketId: socket.id,
            userId,
        });

        //console.log("Players AFTER reconnect:", JSON.stringify(session.players, null, 2));

        if (!player) {
            socket.emit('reconnect-failed', { reason: "player-not-found" });
            return;
        }

        socket.join(sessionCode);

        const safePlayers = session.players.map(p => ({
            id: p.id,
            userId: p.userId,
            name: p.name,
            connected: p.connected,
        }))

        io.to(sessionCode).emit("player-list-update", { players: safePlayers });
        if (session.currentQuestion) socket.emit("new-question", session.currentQuestion);
    });

    //reconnect host
    socket.on("reconnect-host", ({ sessionCode, userId }) => {
        const session = getSession(sessionCode);
        if (!session) {
            socket.emit('reconnect-failed', { reason: "Cannot find Session" });
            return;
        }

        if (session.hostId !== userId) {
            socket.emit("reconnect-failed", { reason: "not-host" });
            return;
        }

        setHostSocket(sessionCode, socket.id);
        socket.join(sessionCode);

        //building safe player object
        const safePlayers = session.players.map(p => ({
            id: p.id,
            userId: p.userId,
            name: p.name,
            connected: p.connected,
            currentPlayerScores: p.currentPlayerScores,

        }));



        //push current state to host
        socket.emit("player-list-update", { players: safePlayers });

        if (session.currentQuestion) {
            socket.emit("new-question", session.currentQuestion);
        }
        io.to(sessionCode).emit("host-status", { connected: true });

    });

    //finalizing results from host
    socket.on('results-finalized', ({ finalRoundData }) => {
        const { sessionCode } = finalRoundData || {};
        //console.log("finalizing round data:", finalRoundData)
        const session = getSession(sessionCode);
        if (!session) return;
        //console.log("final Round Data:", finalRoundData);
        if (socket.id !== session.hostSocketId) return;

        const roundIndex = Number(finalRoundData?.roundIndex);
        if (!Number.isInteger(roundIndex) || roundIndex < 0) {
            console.warn('results-finalized: invalid roundindex', finalRoundData?.roundIndex);
            return;
        }

        const scores = Array.isArray(finalRoundData?.scores) ? finalRoundData.scores : [];
        
        console.log("results-finalized incoming scores sample:", scores?.[0]);
        //merge round scores
        upsertRoundTotals(session, roundIndex, scores || []);

        const answeredMap = session.questionsAnsweredByPlayer || {};
        const correctMap = session.questionsCorrectByPlayer || {};

        //prepare a compact broadcast for everyone
        const leaderboard = Object.entries(session.currentPlayerScores || {})
            .map(([playerId, rec]) => ({
                playerId,
                name: rec.name,
                total: rec.total,
                rounds: rec.byRound,
                questionsAnswered: Number(answeredMap[playerId] || 0),
                questionsCorrect: Number(correctMap[playerId] || 0),
            }))
            .sort((a, b) => b.total - a.total);

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
        if (!session.currentPlayerScores) session.currentPlayerScores = {};
        if (!session.finalizedRounds) session.finalizedRounds = new Set();
        if (!session.questionsAnsweredByPlayer) session.questionsAnsweredByPlayer = {};
        if (!session.questionsCorrectByPlayer) session.questionsCorrectByPlayer = {};

        //idempotency
        if (session.finalizedRounds.has(roundIndex)) {
            console.log('upsertRoundTotals: round already finalized, recomputing only. roundIndex=', roundIndex);
            recomputeTotals(session);
            return;
        }

        for (const { playerId, name, roundScore, questionsAnswered, questionsCorrect } of entries) {
            if (!playerId) continue;
            const pid = String(playerId);

            if (!session.currentPlayerScores[pid]) {
                session.currentPlayerScores[pid] = {
                    name: name ?? "",
                    total: 0,
                    byRound: {},
                };
            }
            //writing the round score
            session.currentPlayerScores[pid].byRound[roundIndex] = Number(roundScore) || 0;

            //accumulate questions answered / correct across the whole game
            const answered = Number(questionsAnswered) || 0;
            const correct = Number(questionsCorrect) || 0;
            session.questionsAnsweredByPlayer[pid] =
                (session.questionsAnsweredByPlayer[pid] || 0) + answered;

            session.questionsCorrectByPlayer[pid] =
                (session.questionsCorrectByPlayer[pid] || 0) + correct;
        }

        recomputeTotals(session);
        session.finalizedRounds.add(roundIndex);
    }

    function recomputeTotals(session) {
        if (!session.currentPlayerScores) return;

        for (const [pid, rec] of Object.entries(session.currentPlayerScores)) {

            console.log('recomputeTotals pid=', pid, 'byRound=', JSON.stringify(rec.byRound));

            const sum = Object.values(rec.byRound || {}).reduce((a, b) => a + (Number(b) || 0), 0);
            rec.total = sum
        }
    }


    //end round
    socket.on('end-round', ({ sessionCode }) => {
        console.log("user has ended round")
        io.to(sessionCode).emit('round-ended', { sessionCode });
    });

    //next round
    socket.on('next-round', ({ sessionCode }) => {
        const session = getSession(sessionCode);
        if (!session) return;

        if (session.hostSocketId !== socket.id) return;

        nextRound(sessionCode);

        const totalRounds = session.roundIds.length ?? 0;
        const currentRoundId = session.roundIds[session.currentRound] ?? null;

        console.log(`host is starting round index ${session.currentRound} of ${totalRounds}`);

        io.to(sessionCode).emit('round-changed', {
            sessionCode,
            roundNumber: session.currentRound,
            roundId: currentRoundId,
            totalRounds,
        });
    });

    //finalize game - show final results
    socket.on('finalize-game', async ({ sessionCode }) => {
        const session = getSession(sessionCode);
        if (!session) return;
        if (socket.id !== session.hostSocketId) return;

        // safey defualts
        const currentScores = session.currentPlayerScores || {};
        const answeredMap = session.questionsAnsweredByPlayer || {};
        const correctMap = session.questionsCorrectByPlayer || {};
        const roundsPlayed = session.finalizedRounds
            ? session.finalizedRounds.size
            : 0;



        // build per-player game stats for logged in users only
        const perPlayerStats = [];

        for (const [pid, rec] of Object.entries(currentScores)) {

            const userMatch = session.players.find(p => p.userId === pid);

            if (!userMatch || !userMatch.userId){
                console.log("player not found, skipping");
                continue;
            }

            const userId = userMatch.userId;
            const totalPoints = Number(rec.total) || 0;
            const questionsAnswered = Number(answeredMap[pid] || 0);
            const questionsCorrect = Number(correctMap[pid] || 0);

            perPlayerStats.push({
                userId,
                name: userMatch.name || rec.name || "",
                points: totalPoints,
                questionsAnswered,
                questionsCorrect,
                roundsPlayed,
            });
        }

        //updating firestore user stats
        if (perPlayerStats.length > 0) {
            try {
                await updateUserStatsForFinishedGame(perPlayerStats);
            } catch(err) {
                console.error('Error updating user stats for finished game:', err);
            }
        }

        //Notify players
        io.to(sessionCode).emit('game-finalized', { message: 'Game Finalized' })
    })

    //firestore updater helper
    async function updateUserStatsForFinishedGame(perPlayerStats) {
        const batch = adminDb.batch();

        perPlayerStats.forEach(p => {
            const {
                userId,
                points,
                questionsAnswered,
                questionsCorrect,
                roundsPlayed,
            } = p;

            const userRef = adminDb.collection('users').doc(userId);

            batch.set(
                userRef,
                {
                    stats: {
                        gamesPlayed: FieldValue.increment(1),
                        totalPoints: FieldValue.increment(points),
                        questionsAnswered: FieldValue.increment(questionsAnswered),
                        questionsCorrect: FieldValue.increment(questionsCorrect),
                        lastPlayedAt: FieldValue.serverTimestamp(),
                    },
                },
                { merge: true }
            );
        });

        await batch.commit();
    }



    //end game
    socket.on('end-game', async ({ sessionCode }) => {
        const session = getSession(sessionCode);

        if (session) {
            // sumary of data to save
            const finalData = {
                sessionCode,
                status: "completed",
                gameId: session.gameId ?? null,
                gameName: session.gameName ?? null,
                hostId: session.hostId,
                hostName: session.hostName ?? null,
                totalRounds: session.roundIds?.length ?? 0,
                roundIds: session.roundIds ?? [],
                playerCount: session.players?.length ?? 0,


                //sanitized players
                players: (session.players || []).map(p => ({
                    id: p.id,
                    userId: p.userId ?? null,
                    name: p.name ?? null,
                    connected: !!p.connected,
                })),
                playerScores: session.currentPlayerScores || {},
                finalizedRounds: Array.from(session.finalizedRounds || []),

                gameStartedAt: session.startedAt || null,
                gameEndedAt: Date.now(),

            };

            const answeredMap = session.questionsAnsweredByPlayer || {};
            const correctMap = session.questionsCorrectByPlayer || {};
            const roundsPlayed = session.finalizedRounds ? session.finalizedRounds.size : 0;

            const exportPlayers = [];

            for (const [pid, rec] of Object.entries(session.currentPlayerScores || {})) {
                const userMatch = session.players.find(p => p.userId === pid);
                if (!userMatch?.userId) continue;

                
                const totalPoints = Number(rec.total) || 0;
                const questionsAnswered = Number(answeredMap[pid] || 0);
                const questionsCorrect = Number(correctMap[pid] || 0);

                exportPlayers.push({
                    userId: userMatch.userId,
                    name: userMatch.name || rec.name || "",
                    total_points: totalPoints,
                    questions_answered: questionsAnswered,
                    questions_correct: questionsCorrect,
                    rounds_played: roundsPlayed,
                });

            }

            finalData.exportVersion = 1;
            finalData.exportSummary = {
                game_name: finalData.gameName || "",
                session_code: finalData.sessionCode,
                host_id: finalData.hostId,
                host_name: finalData.hostName || "",
                game_ended_at: finalData.gameEndedAt,
                players: exportPlayers,
            };

            await saveGameResult(sessionCode, finalData);

            //Notify players
            io.to(sessionCode).emit('game-ended', { message: 'Game Over!' })

            //clean up
            deleteSession(sessionCode);
        }
    });

}