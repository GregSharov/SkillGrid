// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // set to your client URL for production
//     methods: ["GET", "POST"]
//   }
// });

// io.on("connection", (socket) => {
//   // client says: I want to join 'roomId'
//   socket.on("join", (roomId) => {
//     const room = io.sockets.adapter.rooms.get(roomId);
//     const numClients = room ? room.size : 0;

//     if (numClients === 0) {
//       socket.join(roomId);
//       socket.emit("created", roomId);          // you are the initiator
//     } else if (numClients === 1) {
//       socket.join(roomId);
//       socket.emit("joined", roomId);           // you are the second peer
//       socket.to(roomId).emit("ready");         // tell initiator to start offer
//     } else {
//       socket.emit("full", roomId);
//     }
//   });

//   // pass SDP offer/answer and ICE candidates to the other peer in the room
//   socket.on("offer", (roomId, sdp) => socket.to(roomId).emit("offer", sdp));
//   socket.on("answer", (roomId, sdp) => socket.to(roomId).emit("answer", sdp));
//   socket.on("ice-candidate", (roomId, candidate) => socket.to(roomId).emit("ice-candidate", candidate));

//   socket.on("leave", (roomId) => {
//     socket.leave(roomId);
//     socket.to(roomId).emit("peer-left");
//   });
// });

// app.get("/", (_req, res) => res.send("WebRTC signaling server running."));

// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => console.log(`Signaling server on :${PORT}`));



import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const CLIENT_ORIGINS = [
  "http://localhost:3001",
  "https://glossy-duck-1234.ngrok-free.app", // React tunnel
];

const app = express();
app.use(cors({ origin: CLIENT_ORIGINS, credentials: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGINS, methods: ["GET", "POST"], credentials: true },
});

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const num = room ? room.size : 0;
    if (num === 0) {
      socket.join(roomId);
      socket.emit("created", roomId);
    } else if (num === 1) {
      socket.join(roomId);
      socket.emit("joined", roomId);
      socket.to(roomId).emit("ready");
    } else {
      socket.emit("full", roomId);
    }
  });

  socket.on("offer", (roomId, sdp) => socket.to(roomId).emit("offer", sdp));
  socket.on("answer", (roomId, sdp) => socket.to(roomId).emit("answer", sdp));
  socket.on("ice-candidate", (roomId, c) => socket.to(roomId).emit("ice-candidate", c));
  socket.on("leave", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("peer-left");
  });
});

app.get("/", (_req, res) => res.send("Signaling OK"));
server.listen(4000, () => console.log("Signaling on :4000"));
