// server/webrtc-signaling.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// List every frontend origin you actually use (localhost, LAN hostname, tunnels, prod)
const CLIENT_ORIGINS = [process.env.CLIENT_URL, process.env.CLIENT_ADD_URL];
const PORT = process.env.PORT || 4000;

const app = express();
app.use(
  cors({
    origin: CLIENT_ORIGINS,
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  path: "/socket.io",
  cors: { origin: CLIENT_ORIGINS, methods: ["GET", "POST"], credentials: true },
  transports: ["websocket", "polling"], // allow fallback
  pingTimeout: 30000,
  pingInterval: 25000,
});

// --- Simple 2-peer room logic ---
io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const num = room ? room.size : 0;

    if (num === 0) {
      socket.join(roomId);
      socket.emit("created", roomId); // initiator
    } else if (num === 1) {
      socket.join(roomId);
      socket.emit("joined", roomId); // second peer
      socket.to(roomId).emit("ready"); // tell initiator to offer
    } else {
      socket.emit("full", roomId);
    }
  });

  // Relay SDP & ICE
  socket.on("offer", (roomId, sdp) => socket.to(roomId).emit("offer", sdp));
  socket.on("answer", (roomId, sdp) => socket.to(roomId).emit("answer", sdp));
  socket.on("ice-candidate", (roomId, c) =>
    socket.to(roomId).emit("ice-candidate", c)
  );

  socket.on("leave", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("peer-left");
  });

  socket.on("disconnect", () => {
    // Optional: you could notify rooms here
  });
});

app.get("/", (_req, res) => res.send("WebRTC signaling server running."));

// Listen server on port
server.listen(PORT, () => {
  console.log(`Signaling on port: ${PORT}`);
});
