// client/src/pages/CallPage.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

/* ------------------- Signaling URL resolver ------------------- */
// Works on localhost/LAN, tunnels, and prod. Prefers explicit env URL.
// Supports CRA (process.env.REACT_APP_*) and Vite (import.meta.env.VITE_*).
const isHttps =
  typeof window !== "undefined" && window.location.protocol === "https:";
const HOST =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

const ENV_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WEBRTC_URL) ||
  process.env.REACT_APP_WEBRTC_URL;

const ENV_PORT =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WEBRTC_PORT) ||
  process.env.REACT_APP_WEBRTC_PORT;

let SIGNALING_URL = "";
if (ENV_URL) {
  SIGNALING_URL = ENV_URL.replace(/\/$/, "");
} else if (ENV_PORT) {
  SIGNALING_URL = `${isHttps ? "https" : "http"}://${HOST}:${ENV_PORT}`;
} else {
  // Default: dev -> :4000, prod HTTPS -> same-origin
  const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(HOST);
  const devPort = HOST === "localhost" || isIp ? "4000" : "";
  SIGNALING_URL = devPort
    ? `${isHttps ? "https" : "http"}://${HOST}:${devPort}`
    : `${isHttps ? "https" : "http"}://${HOST}`;
}

/* ------------------------ ICE servers ------------------------ */
// Add TURN for production/NAT traversal.
const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  // { urls: "turn:YOUR_TURN_HOST:3478", username: "user", credential: "pass" },
];

export default function CallPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);

  const [status, setStatus] = useState("Idle");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);

  // Initiator state + ref (avoid stale closures inside socket handlers)
  const [isInitiator, setIsInitiator] = useState(false);
  const isInitiatorRef = useRef(false);
  useEffect(() => {
    isInitiatorRef.current = isInitiator;
  }, [isInitiator]);

  /* ---------------- Socket wiring + lifecycle ---------------- */
  useEffect(() => {
    // ✅ capture elements once for stable cleanup (fixes ESLint warning)
    const localEl = localVideoRef.current;
    const remoteEl = remoteVideoRef.current;

    // Create socket (allow polling fallback)
    socketRef.current = io(SIGNALING_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      path: "/socket.io",
    });

    socketRef.current.on("connect", () => {
      setStatus("Connected to signaling");
      socketRef.current.emit("join", roomId);
    });

    socketRef.current.on("created", async () => {
      setIsInitiator(true);
      isInitiatorRef.current = true;
      await setupMediaAndPeer();
    });

    socketRef.current.on("joined", async () => {
      setIsInitiator(false);
      isInitiatorRef.current = false;
      await setupMediaAndPeer();
    });

    socketRef.current.on("full", () => {
      setStatus("Room full");
      alert("Room is full");
      navigate("/");
    });

    socketRef.current.on("ready", async () => {
      if (isInitiatorRef.current && pcRef.current) {
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
      if (remoteEl) remoteEl.srcObject = null; // use captured node
    });

    // Cleanup
    return () => {
      try {
        socketRef.current?.emit("leave", roomId);
        socketRef.current?.disconnect();
      } catch {}

      try {
        pcRef.current?.getSenders().forEach((s) => s.track?.stop());
        pcRef.current?.close();
      } catch {}
      pcRef.current = null;

      try {
        screenTrackRef.current?.stop();
      } catch {}
      screenTrackRef.current = null;

      try {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
      localStreamRef.current = null;

      // ✅ use captured nodes only in cleanup
      if (localEl) localEl.srcObject = null;
      if (remoteEl) remoteEl.srcObject = null;
    };
    // NOTE: roomId only; we use isInitiatorRef to avoid re-wiring on isInitiator changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  /* ------------- Media & Peer setup with fallbacks ------------- */
  const setupMediaAndPeer = async () => {
    setStatus("Getting media…");

    let localStream = null;
    let sendVideo = false;
    let sendAudio = false;

    // 1) Try camera+mic
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      sendVideo = true;
      sendAudio = true;
    } catch (err) {
      console.warn("getUserMedia error:", err?.name, err?.message);
      // 2) If camera blocked or constraints fail, try mic-only
      if (
        err?.name === "NotAllowedError" ||
        err?.name === "SecurityError" ||
        err?.name === "OverconstrainedError"
      ) {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          sendVideo = false;
          sendAudio = true;
          setCamOn(false);
          setStatus("Camera blocked — audio-only mode");
        } catch (err2) {
          console.warn("Audio-only failed:", err2?.name, err2?.message);
          // 3) No local media: recv-only
          setCamOn(false);
          setMicOn(false);
          setStatus("No local media — recv-only");
        }
      } else {
        setCamOn(false);
        setMicOn(false);
        setStatus(`Media error: ${err?.name || "unknown"}`);
      }
    }

    // 4) Create peer connection
    const pc = new RTCPeerConnection({ iceServers });
    pcRef.current = pc;

    // 5) Match SDP to our intent even if we have no tracks
    pc.addTransceiver("video", {
      direction: sendVideo ? "sendrecv" : "recvonly",
    });
    pc.addTransceiver("audio", {
      direction: sendAudio ? "sendrecv" : "recvonly",
    });

    // 6) If we have stream, add tracks & preview
    if (localStream) {
      localStreamRef.current = localStream;
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    }

    // 7) Remote track handler
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
    };

    // 8) ICE -> signaling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", roomId, event.candidate);
      }
    };

    setStatus(isInitiatorRef.current ? "Waiting for peer…" : "Joining room…");
  };

  /* --------------------------- Controls --------------------------- */
  const hangup = () => {
    socketRef.current?.emit("leave", roomId);
    navigate("/");
  };

  const toggleMic = () => {
    const audio = localStreamRef.current?.getAudioTracks()[0];
    if (!audio) return;
    audio.enabled = !audio.enabled;
    setMicOn(audio.enabled);
  };

  const toggleCam = () => {
    const video = localStreamRef.current?.getVideoTracks()[0];
    if (!video) return;
    video.enabled = !video.enabled;
    setCamOn(video.enabled);
  };

  const startShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = displayStream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;
      setSharing(true);

      const sender = pcRef.current
        ?.getSenders()
        .find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);

      if (localVideoRef.current)
        localVideoRef.current.srcObject = displayStream;

      screenTrack.onended = async () => {
        await stopShare();
      };
    } catch (e) {
      console.error("Screen share error:", e);
    }
  };

  const stopShare = async () => {
    screenTrackRef.current?.stop();
    screenTrackRef.current = null;
    setSharing(false);

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender = pcRef.current
      ?.getSenders()
      .find((s) => s.track?.kind === "video");
    if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);
    if (localVideoRef.current)
      localVideoRef.current.srcObject = localStreamRef.current;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <header className="rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Room <span className="text-indigo-600">#{roomId}</span>
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Peer-to-peer encrypted video session.
              </p>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                Status:
                <span className="ml-1 text-indigo-700">{status}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Video grid */}
        <section className="rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 p-4 sm:p-6">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500 rounded-t-2xl -mt-4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local video */}
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-slate-950">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[40vh] md:h-[48vh] object-cover"
              />
              <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200">
                You
              </div>
              {!camOn && (
                <div className="absolute inset-0 grid place-items-center bg-slate-900/70 text-white text-sm">
                  Camera off
                </div>
              )}
              {!micOn && (
                <div className="absolute right-3 top-3 rounded-full bg-rose-600 text-white text-xs px-2 py-0.5">
                  Mic off
                </div>
              )}
            </div>

            {/* Remote video */}
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-slate-950">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-[40vh] md:h-[48vh] object-cover"
              />
              <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200">
                Remote
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={toggleMic}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm ring-1 transition
                ${
                  micOn
                    ? "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                    : "bg-rose-600 text-white ring-rose-500 hover:bg-rose-700"
                }`}
              aria-pressed={micOn ? "true" : "false"}
            >
              {micOn ? "Mute Mic" : "Unmute Mic"}
            </button>

            <button
              onClick={toggleCam}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm ring-1 transition
                ${
                  camOn
                    ? "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                    : "bg-amber-500 text-white ring-amber-400 hover:bg-amber-600"
                }`}
              aria-pressed={camOn ? "true" : "false"}
            >
              {camOn ? "Turn Camera Off" : "Turn Camera On"}
            </button>

            {!sharing ? (
              <button
                onClick={startShare}
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition"
              >
                Share Screen
              </button>
            ) : (
              <button
                onClick={stopShare}
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm bg-slate-700 hover:bg-slate-800 active:scale-[0.98] transition"
              >
                Stop Sharing
              </button>
            )}

            <button
              onClick={hangup}
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition"
            >
              Hang Up
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
