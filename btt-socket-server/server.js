import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket/index.js";
import { markDisconnected } from "./socket/sessionStore.js";

const app = express();
const server = createServer(app);

// ✅ allow multiple origins (comma-separated)
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.get("/", (_req, res) => res.send("ok"));

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      // allow non-browser clients (no origin) + allowed list
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);
  registerSocketHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);

    let res;
    try {
      res = markDisconnected(socket.id, { graceMs: 120_000 });
    } catch (err) {
      console.error("Error in markDisconnected:", err);
      return;
    }

    if (!res) return;

    const { sessionCode, session, isHost } = res;

    if (isHost) {
      io.to(sessionCode).emit("host-status", { connected: false });
    } else {
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Socket.io server running on port ${PORT}`));
