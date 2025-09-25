import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './socket/index.js'

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
    const res = markDisconnected(socket.id, { graceMs: 120_000 });
    if (!res) return;

    const { sessionCode, session, isHost } = res;
    if (isHost) {
      // Optional: notify room host is reconnecting
      io.to(sessionCode).emit("host-status", { connected: false });
    } else {
      io.to(sessionCode).emit("player-list-update", { players: session.players });
    }
  });
});

server.listen(3001, () => {
  console.log('Socket.io server running on port 3001');
});
