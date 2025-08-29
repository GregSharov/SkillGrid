import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const SIGNALING_URL = "http://localhost:4000"; // your signaling server

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
  const screenTrackRef = useRef(null);

  const [status, setStatus] = useState("Idle");
  const [isInitiator, setIsInitiator] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);

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

      // stop screen track if any
      screenTrackRef.current?.stop();
      screenTrackRef.current = null;

      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, isInitiator]);

  const setupMediaAndPeer = async () => {
    setStatus("Getting media…");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection({ iceServers });
    pcRef.current = pc;

    // add local tracks
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // remote track handler
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
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

  // --- simple AV controls (local-only toggles) ---
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

      // replace sender track for video if exists
      const sender = pcRef.current
        ?.getSenders()
        .find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);

      // display on local preview (optional UX)
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

    // restore camera track
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
          {/* hairline */}
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
