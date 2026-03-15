const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { WebSocketServer } = require('ws');

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Serve static client build in production if available
const clientBuildPath = path.join(__dirname, '../../client_dist');
app.use(express.static(clientBuildPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Create HTTP or HTTPS server based on env
const HTTPS_CERT_FILE = process.env.HTTPS_CERT_FILE || process.env.SSL_CERT_FILE;
const HTTPS_KEY_FILE = process.env.HTTPS_KEY_FILE || process.env.SSL_KEY_FILE;

let server;
let protocol = 'http';
if (HTTPS_CERT_FILE && HTTPS_KEY_FILE && fs.existsSync(HTTPS_CERT_FILE) && fs.existsSync(HTTPS_KEY_FILE)) {
  const credentials = {
    cert: fs.readFileSync(HTTPS_CERT_FILE),
    key: fs.readFileSync(HTTPS_KEY_FILE),
  };
  server = https.createServer(credentials, app);
  protocol = 'https';
} else {
  server = http.createServer(app);
}

// --- WebSocket signaling server ---
/**
 * rooms: Map<roomId, Set<Client>>
 * Client: { id: string, ws: WebSocket }
 */
const rooms = new Map();

let nextClientId = 1;

function getOtherClientInRoom(roomId, clientId) {
  const clients = rooms.get(roomId);
  if (!clients) return undefined;
  for (const client of clients) {
    if (client.id !== clientId) return client;
  }
  return undefined;
}

function send(ws, message) {
  try {
    ws.send(JSON.stringify(message));
  } catch (err) {
    // ignore
  }
}

function broadcastRoom(roomId, message, excludeId) {
  const clients = rooms.get(roomId);
  if (!clients) return;
  for (const client of clients) {
    if (excludeId && client.id === excludeId) continue;
    send(client.ws, message);
  }
}

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  const clientId = `c_${nextClientId++}`;
  let joinedRoomId = undefined;

  send(ws, { type: 'welcome', clientId });

  ws.on('message', (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (err) {
      return;
    }

    const { type, roomId, payload } = message || {};

    if (type === 'join') {
      if (!roomId) {
        return send(ws, { type: 'error', message: 'roomId required' });
      }

      let clients = rooms.get(roomId);
      if (!clients) {
        clients = new Set();
        rooms.set(roomId, clients);
      }

      if (clients.size >= 2) {
        return send(ws, { type: 'full', roomId });
      }

      const client = { id: clientId, ws };
      clients.add(client);
      joinedRoomId = roomId;

      send(ws, { type: 'joined', roomId, clientId });

      if (clients.size === 2) {
        // Notify the first client to start negotiation to avoid offer glare
        const [first, second] = Array.from(clients);
        send(first.ws, { type: 'start', roomId });
        // Let both know peer is ready
        broadcastRoom(roomId, { type: 'peer-ready', roomId }, undefined);
      }
      return;
    }

    if (!joinedRoomId) {
      return send(ws, { type: 'error', message: 'join a room first' });
    }

    if (type === 'leave') {
      const clients = rooms.get(joinedRoomId);
      if (clients) {
        for (const c of clients) {
          if (c.id === clientId) {
            clients.delete(c);
            break;
          }
        }
        if (clients.size === 0) {
          rooms.delete(joinedRoomId);
        } else {
          broadcastRoom(joinedRoomId, { type: 'peer-left', roomId: joinedRoomId }, clientId);
        }
      }
      joinedRoomId = undefined;
      return;
    }

    if (type === 'offer' || type === 'answer' || type === 'candidate') {
      const other = getOtherClientInRoom(joinedRoomId, clientId);
      if (other) {
        return send(other.ws, { type, roomId: joinedRoomId, payload });
      }
      return;
    }
  });

  ws.on('close', () => {
    if (!joinedRoomId) return;
    const clients = rooms.get(joinedRoomId);
    if (!clients) return;
    for (const c of clients) {
      if (c.id === clientId) {
        clients.delete(c);
        break;
      }
    }
    if (clients.size === 0) {
      rooms.delete(joinedRoomId);
    } else {
      broadcastRoom(joinedRoomId, { type: 'peer-left', roomId: joinedRoomId }, clientId);
    }
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Signaling server listening on ${protocol}://0.0.0.0:${PORT}`);
});

