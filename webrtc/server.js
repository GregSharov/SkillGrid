// server/webrtc-signaling.js
import express from "express";
import https from "https";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const FRONT_URL = process.env.FRONTEND_URL;
const FRONT_LOCAL_URL = process.env.FRONT_LOCAL_URL;
// List every frontend origin you actually use (localhost, LAN hostname, tunnels, prod)
const ALLOWLIST = [FRONT_URL, FRONT_LOCAL_URL].filter(
  Boolean
);
console.log("Allowed origins:", ALLOWLIST);

const PORT = Number(process.env.SIGNALING_PORT || 4000);
const isProd = process.env.NODE_ENV === "production";

// For LAN/local HTTPS testing (mkcert)
const key = !isProd ? fs.readFileSync(process.env.SSL_KEY_FILE) : null;
const cert = !isProd ? fs.readFileSync(process.env.SSL_CERT_FILE) : null;

const app = express();

// Express CORS with function-based origin check (handles regex + strings)
app.use(
  cors({
    origin(origin, cb) {
      // Non-browser requests (curl, mobile apps) may have no origin
      if (!origin) return cb(null, true);
      const ok = ALLOWLIST.some((rule) =>
        typeof rule === "string" ? rule === origin : rule.test?.(origin)
      );
      return ok ? cb(null, true) : cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

let server;
let protocol = "http";

if (!isProd) {
  server = https.createServer({ key, cert }, app);
  protocol = "https";
} else {
  server = http.createServer(app);
}

// Socket.IO CORS mirrors Express logic
const io = new Server(server, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  pingTimeout: 30000,
  pingInterval: 25000,
  cors: {
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const ok = ALLOWLIST.some((rule) =>
        typeof rule === "string" ? rule === origin : rule.test?.(origin)
      );
      return ok ? cb(null, true) : cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

// --- Simple 2-peer room logic ---
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
  });

  socket.on("join", (roomId) => {
    console.log("Client joining room:", roomId, "Socket:", socket.id);
    const room = io.sockets.adapter.rooms.get(roomId);
    const num = room ? room.size : 0;
    console.log("Room size:", num);

    if (num === 0) {
      socket.join(roomId);
      socket.emit("created", roomId);
      console.log("Room created, emitted 'created' to:", socket.id);
    } else if (num === 1) {
      socket.join(roomId);
      socket.emit("joined", roomId);
      socket.to(roomId).emit("ready");
      console.log("Room joined, emitted 'joined' to:", socket.id, "and 'ready' to others");
    } else {
      socket.emit("full", roomId);
      console.log("Room full, emitted 'full' to:", socket.id);
    }
  });

  // Relay SDP & ICE
  socket.on("offer", (roomId, sdp) => {
    console.log("Relaying offer for room:", roomId, "from:", socket.id);
    socket.to(roomId).emit("offer", sdp);
  });

  socket.on("answer", (roomId, sdp) => {
    console.log("Relaying answer for room:", roomId, "from:", socket.id);
    socket.to(roomId).emit("answer", sdp);
  });

  socket.on("ice-candidate", (roomId, c) => {
    console.log("Relaying ICE candidate for room:", roomId, "from:", socket.id);
    socket.to(roomId).emit("ice-candidate", c);
  });

  socket.on("leave", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("peer-left");
  });
});

app.get("/", (_req, res) => res.send("WebRTC signaling server running."));

const HOST = process.env.HOST;
server.listen(PORT, () => {
  console.log(`🔌 Signaling on ${protocol}://${HOST}:${PORT}`);
  console.log("Allowed origins:", ALLOWLIST);
});
