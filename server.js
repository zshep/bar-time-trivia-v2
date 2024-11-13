const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",  // You can replace '*' with the actual URL of your client-side to increase security
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");

  // Event listeners here, for example:
  socket.on("message", (msg) => {
    console.log("message received: ", msg);
    io.emit("message", msg); // Emit the message back to all clients
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

httpServer.listen(3001, () => {
  console.log("Socket.io server listening on port 3001");
});
