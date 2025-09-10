// server/webrtc-signaling.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const FRONT_URL = process.env.CLIENT_URL;
const FRONT_LOCAL_URL = process.env.CLIENT_ADD_URL;
// List every frontend origin you actually use (localhost, LAN hostname, tunnels, prod)
const ALLOWLIST = [FRONT_URL, FRONT_LOCAL_URL].filter(
  Boolean
);

const PORT = Number(process.env.PORT || process.env.SIGNALING_PORT || 4000);

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

const server = http.createServer(app);

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
});

app.get("/", (_req, res) => res.send("WebRTC signaling server running."));

server.listen(PORT, () => {
  console.log(`🔌 Signaling on :${PORT}`);
  console.log("Allowed origins:", ALLOWLIST);
});
