import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './socket/index.js';
import { markDisconnected } from './socket/sessionStore.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  registerSocketHandlers(io, socket);


 socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);
    
    let res;
    try {
      res = markDisconnected(socket.id, { graceMs: 120_000});
    } catch (err) {
      console.error("Error in Markdisonnected:", err);
      return;
    }  
    
    if (!res) return;

    const { sessionCode, session, isHost } = res;

    if (isHost) {
      io.to(sessionCode).emit("host-status", { connected: fasle });
    } else {
      //building Safe/ non-circular payload
      const safePlayers = session.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isConnected: p.isConnected,
      }));
      io.to(sessionCode).emit("player-list-update", { players: safePlayers });
    }
    
  });
});

server.listen(3001, () => {
  console.log('Socket.io server running on port 3001');
});
