import { useEffect, useMemo, useRef, useState } from 'react';

const defaultRoomId = 'demo';

function App() {
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('disconnected');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const localStreamRef = useRef(null);

  const signalingUrl = useMemo(() => {
    const loc = window.location;
    const wsProtocol = loc.protocol === 'https:' ? 'wss' : 'ws';
    return `${wsProtocol}://${loc.hostname}:${import.meta.env.VITE_SIGNAL_PORT || 3001}/ws`;
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pcRef.current) pcRef.current.close();
      if (localStreamRef.current) {
        for (const track of localStreamRef.current.getTracks()) track.stop();
      }
    };
  }, []);

  const createPeer = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    });
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        wsRef.current?.send(JSON.stringify({ type: 'candidate', roomId, payload: e.candidate }));
      }
    };
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };
    return pc;
  };

  const ensureMedia = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  };

  const connect = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setStatus('connecting');
    const ws = new WebSocket(signalingUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      ws.send(JSON.stringify({ type: 'join', roomId }));
    };
    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'welcome') setClientId(msg.clientId);
      if (msg.type === 'joined') {
        await ensureMedia();
      }
      if (msg.type === 'start') {
        // become offerer to avoid glare per webrtc.org samples
        if (!pcRef.current) pcRef.current = createPeer();
        const stream = await ensureMedia();
        stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: 'offer', roomId, payload: offer }));
      }
      if (msg.type === 'offer') {
        if (!pcRef.current) pcRef.current = createPeer();
        const stream = await ensureMedia();
        stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.payload));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', roomId, payload: answer }));
      }
      if (msg.type === 'answer') {
        if (pcRef.current && !pcRef.current.currentRemoteDescription) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.payload));
        }
      }
      if (msg.type === 'candidate') {
        try {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(msg.payload));
        } catch {}
      }
      if (msg.type === 'peer-left') {
        pcRef.current?.close();
        pcRef.current = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      }
      if (msg.type === 'full') {
        setStatus('room full');
        ws.close();
      }
    };
    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('error');
  };

  const leave = () => {
    wsRef.current?.send(JSON.stringify({ type: 'leave', roomId }));
    wsRef.current?.close();
    pcRef.current?.close();
    pcRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setStatus('disconnected');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">WebRTC P2P Demo</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="text-sm">
            <span className="block text-gray-600 mb-1">Room ID</span>
            <input
              className="border rounded px-3 py-2 w-56"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={connect}
            >
              Join
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded"
              onClick={leave}
            >
              Leave
            </button>
          </div>
          <div className="text-sm text-gray-600">Status: {status} {clientId && `(you: ${clientId})`}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div>
            <h2 className="font-semibold mb-2">Local</h2>
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded shadow bg-black" />
          </div>
          <div>
            <h2 className="font-semibold mb-2">Remote</h2>
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded shadow bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
