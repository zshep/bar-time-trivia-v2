import { getSession, deleteSession, createSession, addPlayerToSession, startGame, nextQuestion } from './sessionStore.js';
import { saveGameResult } from '../firestore/saveGameResult.js';


export function registerSocketHandlers(io, socket) {

    // Host creates a session
    socket.on('create-session', ({ sessionCode, hostId, gameId, gameName }) => {
        console.log(`Session created: ${sessionCode} by host ${hostId} for game ${gameName}`);
        createSession(sessionCode, hostId, gameName, gameId, socket.id);


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
            socket.emit('join-error', { message: "Session not found" });
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
                gameId: session.gamerId,
                gameStarted: session.gameStarted
            });
        } else {
            console.log("session does not exist for sessionCode", sessionCode);
            console.log("current session store keys:", Array.from(sessionStorage.keys()));
        }
    });

    //player sending answer to host
    socket.on("player-answer", ({ playerId, choice, sessionCode }) => {
        const session = getSession(sessionCode);

        if(!session || !session.hostSocketId){

            return console.error("No session or host socket ID found");
        }

        console.log(`Server received answer from ${playerId}: ${choice} in ${sessionCode}`);

        //rebroadcasting answer submission
        
        io.to(session.hostSocketId).emit("submit-answer", { playerId, choice, sessionCode });
    })


    // Start game
    socket.on(`start-game`, ({ sessionCode }) => {
        console.log("start-game initiated ")
        startGame(sessionCode);
        io.to(sessionCode).emit('game-started');
        nextQuestion();
    });

    // Recieve and forward question from Host
    socket.on('send-question', ({ sessionCode, question }) => {
        const session = getSession(sessionCode);
        console.log("Host sent question for session:", sessionCode);
        //store question for reconnects
        session.currentQuestion = question;

        io.to(sessionCode).emit('new-question', question);
    });

    //Reconnecting player
    socket.on("reconnect-player", ({ sessionCode, userId }) =>
    {
        console.log("session code:", sessionCode);
        const session = getSession(sessionCode);
        if (session) {
            socket.join(sessionCode);
            console.log(`Player ${userId} reconnected to session ${sessionCode}`);

            //grabbing round data???
            const currentRound = session.currentRound || 1;
            const currentQuestionIndex = session.currentQuestion || 0;
            console.log(`The current round is ${currentRound} and the question we are on is ${currentQuestionIndex}`);

            //emit the current question to the reconnected player
            const question = session.currentQuestion;

            if (question) {
                socket.emit("new-question", question);
            } else {
                console.warn("No current question during reconnect");
            }

        }
        console.log("the user session cannot be found");

    })

    socket.on("reconnect-host", ({sessionCode, userId}) => {
        const session = getSession(sessionCode);
        if (session){
            socket.join(sessionCode);
            console.log("Host should have rejoined session");

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