import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const SIGNALING_URL = "http://localhost:4000"; // <- your signaling server

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  // For production/NAT traversal reliability add your TURN server here.
];

export default function CallPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const [status, setStatus] = useState("Idle");
  const [isInitiator, setIsInitiator] = useState(false);

  useEffect(() => {
    socketRef.current = io(SIGNALING_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      setStatus("Connected to signaling");
      socketRef.current.emit("join", roomId);
    });

    socketRef.current.on("created", async () => {
      setIsInitiator(true);
      await setupMediaAndPeer();
    });

    socketRef.current.on("joined", async () => {
      setIsInitiator(false);
      await setupMediaAndPeer();
    });

    socketRef.current.on("full", () => {
      setStatus("Room full");
      alert("Room is full");
      navigate("/");
    });

    socketRef.current.on("ready", async () => {
      // Only initiator creates offer
      if (isInitiator && pcRef.current) {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socketRef.current.emit("offer", roomId, offer);
      }
    });

    socketRef.current.on("offer", async (sdp) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit("answer", roomId, answer);
    });

    socketRef.current.on("answer", async (sdp) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socketRef.current.on("ice-candidate", async (candidate) => {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding received ICE candidate", err);
      }
    });

    socketRef.current.on("peer-left", () => {
      setStatus("Peer left");
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    });

    // cleanup
    return () => {
      socketRef.current?.emit("leave", roomId);
      socketRef.current?.disconnect();

      pcRef.current?.getSenders().forEach((s) => s.track?.stop());
      pcRef.current?.close();
      pcRef.current = null;

      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, isInitiator]);

  const setupMediaAndPeer = async () => {
    setStatus("Getting media…");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection({ iceServers });
    pcRef.current = pc;

    // add local tracks
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // remote track handler
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    };

    // relay local ICE candidates to peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", roomId, event.candidate);
      }
    };

    setStatus(isInitiator ? "Waiting for peer…" : "Joining room…");
  };

  const hangup = () => {
    socketRef.current?.emit("leave", roomId);
    navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Room: {roomId}</h1>
      <p className="text-gray-600">{status}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded bg-black" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded bg-black" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={hangup}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Hang Up
        </button>
      </div>
    </div>
  );
}
