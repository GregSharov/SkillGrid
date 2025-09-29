// server/webrtc-signaling.js
import express from "express";
import https from "https";
import http from "http";
import { PeerServer } from "peer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const FRONT_URL = process.env.FRONTEND_URL;
const FRONT_LOCAL_URL = process.env.FRONT_LOCAL_URL;
// List every frontend origin you actually use (localhost, LAN hostname, tunnels, prod)
const ALLOWLIST = [FRONT_URL, FRONT_LOCAL_URL].filter(
  Boolean
);
console.log("Allowed origins:", ALLOWLIST);

const PORT = Number(process.env.SIGNALING_PORT || 4000);
const HOST = process.env.HOST || 'localhost';
const isProd = process.env.NODE_ENV === "production";

// For LAN/local HTTPS testing (mkcert)
const key = !isProd && process.env.SSL_KEY_FILE ? fs.readFileSync(process.env.SSL_KEY_FILE) : null;
const cert = !isProd && process.env.SSL_CERT_FILE ? fs.readFileSync(process.env.SSL_CERT_FILE) : null;

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

// Serve static files from client dist if it exists
const clientDistPath = path.join(process.cwd(), '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

let server;
let protocol = "http";

if (!isProd && key && cert) {
  server = https.createServer({ key, cert }, app);
  protocol = "https";
} else {
  server = http.createServer(app);
}

// Start PeerJS server on same HTTP(S) server, path /peerjs
function startPeerServer(server) {
  // PeerServer accepts an `options` object: { server, path }
  PeerServer({ server, path: '/peerjs' });
  console.log('🔌 PeerJS server mounted at /peerjs');
}

// Health endpoint
app.get("/", (_req, res) => {
  res.send(`WebRTC signaling server running on ${protocol}://${HOST}:${PORT}`);
});

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`🔌 Signaling on ${protocol}://${HOST}:${PORT}`);
  console.log("Allowed origins:", ALLOWLIST);
  startPeerServer(server);
});
