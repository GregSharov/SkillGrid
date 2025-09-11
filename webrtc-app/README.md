WebRTC P2P Demo (Express + React + Tailwind)

Local development (two devices on LAN)

1) Terminal A: start signaling server
```
cd server
npm run dev
```

2) Terminal B: start client dev server (LAN)
```
cd client
npm run dev -- --host
```

3) On device 1 and device 2, open the LAN URL shown by Vite (e.g., http://<your-LAN-IP>:5173).
- Use the same Room ID on both devices
- Click Join on both
- Allow camera/microphone

Notes:
- For Chrome on mobile, HTTPS may be required for getUserMedia. If needed, run the server with local certs:
  - Put cert paths in env: HTTPS_CERT_FILE=/path/cert.pem HTTPS_KEY_FILE=/path/key.pem
  - Build client then run server (serves static):
```
npm run build
cd server
PORT=3001 HTTPS_CERT_FILE=... HTTPS_KEY_FILE=... npm run start
```
Then open https://<your-LAN-IP>:3001 on both devices.

Production build + serve
```
npm run build
cd server
npm run start
```
Visit http://localhost:3001 (or LAN IP) and join the same room from two devices.

Deploy to Render.com
- Create a new Web Service from this repo.
- Root directory: /
- Build Command:
```
cd server && npm install && cd ../client && npm install && cd .. && npm run build
```
- Start Command:
```
cd server && npm run start
```
- Environment: PORT is provided by Render

How it works (webrtc.org-aligned)
- Two peers join a room via WebSocket signaling.
- When the second peer joins, the server tells the first to start (be offerer) to avoid glare.
- Peers exchange SDP offers/answers and ICE candidates over WebSocket.
- Media flows peer-to-peer via WebRTC with a public STUN server.

