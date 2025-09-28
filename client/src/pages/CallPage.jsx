import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

/* --------- Signaling URL (explicit env in prod; localhost in dev) --------- */
const REACT_APP_WEBRTC_URL = process.env.REACT_APP_WEBRTC_URL;

const SIGNALING_URL = REACT_APP_WEBRTC_URL || `${window.location.protocol}//${window.location.hostname}:4000`;

console.log('SIGNALING_URL:', SIGNALING_URL);
console.log('REACT_APP_WEBRTC_URL:', process.env.REACT_APP_WEBRTC_URL);

/* ------------------------ ICE servers (expressTURN) ------------------------ */
const username = process.env.REACT_APP_TURN_USERNAME;
const password = process.env.REACT_APP_TURN_PASSWORD;

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  ...(process.env.REACT_APP_TURN_HOST && process.env.REACT_APP_TURN_PORT_UDP
    ? [{ urls: `stun:${process.env.REACT_APP_TURN_HOST}:${process.env.REACT_APP_TURN_PORT_UDP}` }]
    : []),
  ...(process.env.REACT_APP_TURN_HOST && process.env.REACT_APP_TURN_PORT_UDP && username && password
    ? [{ urls: `turn:${process.env.REACT_APP_TURN_HOST}:${process.env.REACT_APP_TURN_PORT_UDP}?transport=udp`, username, credential: password }]
    : []),
  ...(process.env.REACT_APP_TURN_HOST && process.env.REACT_APP_TURN_PORT_TCP && username && password
    ? [{ urls: `turn:${process.env.REACT_APP_TURN_HOST}:${process.env.REACT_APP_TURN_PORT_TCP}?transport=tcp`, username, credential: password }]
    : []),
  ...(process.env.REACT_APP_TURN_HOST && process.env.REACT_APP_TURN_PORT_TLS && username && password
    ? [{ urls: `turns:${process.env.REACT_APP_TURN_HOST}:${process.env.REACT_APP_TURN_PORT_TLS}?transport=tcp`, username, credential: password }]
    : []),
];

const FORCE_TURN = String(process.env.REACT_APP_FORCE_TURN || "false").toLowerCase() === "true";

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

  // initiator tracking (ref avoids stale closure in handlers)
  const [isInitiator, setIsInitiator] = useState(false);
  const isInitiatorRef = useRef(false);
  useEffect(() => {
    isInitiatorRef.current = isInitiator;
  }, [isInitiator]);

  /* ------------------------- Socket wiring & lifecycle ------------------------- */
  useEffect(() => {
    // capture nodes once for safe cleanup
    const localEl = localVideoRef.current;
    const remoteEl = remoteVideoRef.current;

    // connect to signaling
    socketRef.current = io(SIGNALING_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      path: "/socket.io",
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setStatus(`Connection failed: ${error.message}`);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setStatus(`Disconnected: ${reason}`);
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully");
      setStatus("Connected to signaling");
      socketRef.current.emit("join", roomId);
      console.log("Emitted join for room:", roomId);
    });

    socketRef.current.on("created", async () => {
      console.log("Room created - I am the initiator");
      setIsInitiator(true);
      isInitiatorRef.current = true;
      await setupMediaAndPeer();
    });

    socketRef.current.on("joined", async () => {
      console.log("Room joined - I am the joiner");
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
      console.log("Ready signal received");
      // Only the initiator should create an offer when ready signal is received
      if (isInitiatorRef.current && pcRef.current) {
        console.log("I am the initiator - creating offer");
        const offer = await pcRef.current.createOffer();
        console.log("Created offer:", offer);
        await pcRef.current.setLocalDescription(offer);
        socketRef.current.emit("offer", roomId, offer);
        console.log("Emitted offer for room:", roomId);
      } else {
        console.log("I am the joiner - waiting for offer");
      }
    });

    socketRef.current.on("offer", async (sdp) => {
      console.log("Received offer:", sdp);
      if (!pcRef.current) return;
      
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log("✅ Remote description set successfully");
        
        const answer = await pcRef.current.createAnswer();
        console.log("Created answer:", answer);
        await pcRef.current.setLocalDescription(answer);
        socketRef.current.emit("answer", roomId, answer);
        console.log("Emitted answer for room:", roomId);
      } catch (error) {
        console.error("❌ Error setting remote description:", error);
        setStatus("Failed to process offer");
      }
    });

    socketRef.current.on("answer", async (sdp) => {
      console.log("Received answer:", sdp);
      if (!pcRef.current) return;
      
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log("✅ Remote description set successfully");
      } catch (error) {
        console.error("❌ Error setting remote description:", error);
        setStatus("Failed to process answer");
      }
    });

    socketRef.current.on("ice-candidate", async (candidate) => {
      console.log("Received ICE candidate:", candidate);
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socketRef.current.on("peer-left", () => {
      setStatus("Peer left");
      if (remoteEl) remoteEl.srcObject = null;
    });

    // cleanup
    return () => {
      try {
        socketRef.current?.emit("leave", roomId);
        socketRef.current?.disconnect();
      } catch { }

      try {
        pcRef.current?.getSenders().forEach((s) => s.track?.stop());
        pcRef.current?.close();
      } catch { }
      pcRef.current = null;

      try {
        screenTrackRef.current?.stop();
      } catch { }
      screenTrackRef.current = null;

      try {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch { }
      localStreamRef.current = null;

      if (localEl) localEl.srcObject = null;
      if (remoteEl) remoteEl.srcObject = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Add this useEffect to monitor peer connection state
  useEffect(() => {
    const interval = setInterval(() => {
      if (pcRef.current) {
        console.log("PC connection state:", pcRef.current.connectionState);
        console.log("PC ICE connection state:", pcRef.current.iceConnectionState);
        console.log("PC senders:", pcRef.current.getSenders());
        console.log("PC receivers:", pcRef.current.getReceivers());
        console.log("PC receiver tracks:", pcRef.current.getReceivers().map(r => r.track));
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  /* ---------------------- Media & RTCPeerConnection setup --------------------- */
  const setupMediaAndPeer = async () => {
    setStatus("Getting media…");

    let localStream = null;
    let sendVideo = false;
    let sendAudio = false;

    // 1) try cam+mic
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      sendVideo = true;
      sendAudio = true;
    } catch (err) {
      console.warn("getUserMedia error:", err?.name, err?.message);

      // iPad/Safari specific handling
      if (err?.name === "NotAllowedError") {
        setStatus("Camera/microphone access denied. Please allow access and refresh.");
        return;
      }

      // 2) fallback mic-only
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
          // 3) recv-only
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

    // 4) peer connection
    const pc = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: FORCE_TURN ? "relay" : "all",
    });
    pcRef.current = pc;

    // 5) align transceivers (so SDP matches even without local tracks)
    pc.addTransceiver("video", {
      direction: sendVideo ? "sendrecv" : "recvonly",
    });

    pc.addTransceiver("audio", {
      direction: sendAudio ? "sendrecv" : "recvonly",
    });

    pc.ontransceiver = (event) => {
      console.log("Transceiver added:", event.transceiver);
    };

    // 6) add local tracks + preview
    if (localStream) {
      localStreamRef.current = localStream;
      localStream.getTracks().forEach((track) => {
        console.log("Adding track:", track.kind, track.id);
        const sender = pc.addTrack(track, localStream);
        console.log("Track sender:", sender);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      console.log("Local stream setup complete");
    }

    // 7) remote track
    pc.ontrack = (event) => {
      console.log("=== ONTRACK EVENT ===");
      console.log("Event:", event);
      console.log("Track:", event.track);
      console.log("Streams:", event.streams);
      console.log("Transceiver:", event.transceiver);

      const [remoteStream] = event.streams;
      if (remoteStream) {
        console.log("Remote stream tracks:", remoteStream.getTracks());
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          console.log("✅ Set remote video source");
        } else {
          console.log("❌ Remote video ref is null");
        }
      } else {
        console.log("❌ No remote stream in event");
      }
    };

    // In setupMediaAndPeer function, add stream monitoring
    pc.onaddstream = (event) => {
      console.log("=== ONADDSTREAM EVENT ===");
      console.log("Stream:", event.stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.stream;
        console.log("✅ Set remote video source via onaddstream");
      }
    };

    // 8) ICE -> signaling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", roomId, event.candidate);
        console.log('Sent ICE candidate:', event.candidate.type || 'candidate');
      }
    };

    // In setupMediaAndPeer function, add connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === 'connected') {
        console.log("✅ WebRTC connection established!");
        setStatus("Connected to peer");
      } else if (pc.connectionState === 'failed') {
        console.log("❌ WebRTC connection failed");
        setStatus("Connection failed");
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.warn('ICE failed; attempting ICE restart');
        try {
          pc.restartIce();
        } catch (e) {
          console.error('ICE restart error:', e);
        }
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', pc.iceGatheringState);
    };

    pc.onsignalingstatechange = () => {
      console.log('Signaling state:', pc.signalingState);
    };

    setStatus(isInitiatorRef.current ? "Waiting for peer…" : "Joining room…");
  };

  /* --------------------------------- Controls -------------------------------- */
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

      if (localVideoRef.current) localVideoRef.current.srcObject = displayStream;

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
                ${micOn
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
                ${camOn
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
