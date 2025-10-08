import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
// import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../services/apiBase';

// Function to generate short UUID
// function generateShortUuid() {
// return uuidv4().substring(0, 4).toUpperCase();
// }

export default function CallPage() {
  const { roomId, slotId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [myId, setMyId] = useState('');
  const [remoteId, setRemoteId] = useState('');
  const [connected, setConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const [scheduledLesson, setScheduledLesson] = useState(null);
  const [lessonName, setLessonName] = useState('');
  const [teachersName, setTeachersName] = useState('');
  const [studentsName, setStudentsName] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get user's role
  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_URL}/user/me`, {
        credentials: "include",
      });
      const data = await res.json();
      setUserRole(data.user.role);
    })();
  }, []);

  // Get scheduled lesson by room id
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/schedule/room/${roomId}`);
        const data = await res.json();
        setScheduledLesson(data.data);
        setTeachersName(data.data.teacher.firstName + ' ' + data.data.teacher.lastName);
        setStudentsName(data.data.student.firstName + ' ' + data.data.student.lastName);

        // Find the specific slot by slotId
        const specificSlot = data.data.slots.find(slot => slot._id === slotId);
        if (specificSlot) {
          setLessonName(specificSlot.lesson.name);
        }
      } catch (error) {
        console.error('Error fetching scheduled lesson', error);
      }
    })();
  }, [roomId, slotId]);

  // Set user's peerId from DB by role
  useEffect(() => {
    if (!scheduledLesson || !userRole) return;

    try {
      if (userRole === "teacher") {
        setMyId(scheduledLesson.peers[0].teacherPeerId);
        setRemoteId(scheduledLesson.peers[0].studentPeerId);
      } else if (userRole === "student") {
        setMyId(scheduledLesson.peers[0].studentPeerId);
        setRemoteId(scheduledLesson.peers[0].teacherPeerId);
      }
    } catch (error) {
      console.error('Error setting peer ID by role', error);
    }
  }, [scheduledLesson, userRole]);

  useEffect(() => {
    // Don't create peer until we have myId from database
    if (!myId) {
      console.log('Waiting for myId to be set from database...');
      return;
    }

    console.log('Creating peer with ID:', myId);
    console.log('Will connect to remote peer:', remoteId);

    (async () => {
      // get local media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      } catch (err) {
        console.error('getUserMedia failed', err);
        alert('Camera/mic permission required');
        return;
      }

      // Create Peer instance with the ID from database
      const peer = new Peer(myId, {
        debug: 3,
        config: {
          iceServers: [
            // Free Google STUN (optional but good fallback)
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },

            // Your TURN server (UDP + TCP)
            {
              urls: [
                `turn:${process.env.REACT_APP_TURN_HOST}:${process.env.REACT_APP_TURN_PORT_UDP}?transport=udp`,
                `turn:${process.env.REACT_APP_TURN_HOST}:${process.env.REACT_APP_TURN_PORT_TCP}?transport=tcp`,
                `turns:${process.env.REACT_APP_TURN_HOST}:${process.env.REACT_APP_TURN_PORT_TLS}?transport=tcp`
              ],
              username: process.env.REACT_APP_TURN_USERNAME,
              credential: process.env.REACT_APP_TURN_PASSWORD
            }
          ]
        }
      });

      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('Peer connection opened with ID:', id);
      });

      // When someone calls us:
      peer.on('call', (call) => {
        console.log('incoming call', call);
        setIncomingCall(call);
        setShowIncomingCallModal(true);
      });

      peer.on('error', (err) => {
        console.warn('peer error', err);
      });
    })();

    return () => {
      if (peerRef.current) peerRef.current.destroy();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [myId, remoteId]); // Only recreate peer when myId changes

  function callPeer() {
    if (!peerRef.current) return;
    if (!remoteId) return alert('Enter remote peer id');
    const call = peerRef.current.call(remoteId, localStreamRef.current);
    call.on('stream', (remoteStream) => {
      remoteVideoRef.current.srcObject = remoteStream;
      setConnected(true);
    });
    call.on('error', (err) => console.warn('call error', err));
  }

  function toggleMute() {
    if (!localStreamRef.current) return;

    const audioTracks = localStreamRef.current.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = isMuted;
    });

    setIsMuted(!isMuted);
  }

  function toggleVideo() {
    if (!localStreamRef.current) return;

    const videoTracks = localStreamRef.current.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = isVideoOff;
    });

    setIsVideoOff(!isVideoOff);
  }

  function acceptCall() {
    if (!incomingCall || !localStreamRef.current) return;

    incomingCall.answer(localStreamRef.current);
    incomingCall.on('stream', (remoteStream) => {
      remoteVideoRef.current.srcObject = remoteStream;
      setConnected(true);
    });

    setShowIncomingCallModal(false);
    setIncomingCall(null);
  }

  function declineCall() {
    if (!incomingCall) return;

    incomingCall.close();
    setShowIncomingCallModal(false);
    setIncomingCall(null);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }

  function endCall() {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    navigate('/account');
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Header */}
        <header className="rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  {lessonName}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold">
                  {userRole === "student" ? "Teacher:" : "Student:"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-sky-50 px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {userRole === "student" ? teachersName : studentsName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
                connected 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-2 ring-green-200' 
                  : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white ring-2 ring-amber-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-white animate-pulse' : 'bg-white/80'}`} />
                {connected ? 'Connected' : myId ? 'Ready' : 'Connecting...'}
              </div>
              {!connected && myId && remoteId && (
                <button
                  className="inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-semibold text-white shadow-md bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={callPeer}
                  disabled={!myId || connected || !remoteId}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Start Call
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Video Section */}
        <section ref={videoContainerRef} className="rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500" />
          
          {/* Main Video Container - Remote User (Large) */}
          <div className="relative bg-slate-950 aspect-video">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Remote User Label */}
            <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-sm px-4 py-2 shadow-lg ring-1 ring-slate-200">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-slate-800">
                {userRole === "teacher" ? studentsName : teachersName}
              </span>
            </div>

            {/* Waiting State for Remote */}
            {!connected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center space-y-4 px-4">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                    <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {userRole === "teacher" ? studentsName : teachersName}
                    </h3>
                    <p className="text-slate-400 text-sm">Waiting to join...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Local Video - Picture in Picture (Small overlay) */}
            <div className="absolute bottom-4 right-4 w-56 h-40 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/30 bg-slate-950 transition-all hover:ring-white/50 hover:scale-105">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Local User Label */}
              <div className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                You ({userRole === "teacher" ? teachersName : studentsName})
              </div>

              {/* Video Off State */}
              {isVideoOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  <svg className="w-10 h-10 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                  <span className="text-xs text-slate-400">Camera off</span>
                </div>
              )}

              {/* Muted Indicator */}
              {isMuted && (
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 shadow-lg">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 px-6 py-5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Microphone Toggle */}
              <button
                onClick={toggleMute}
                className={`group relative inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-md ring-1 transition-all active:scale-95 ${
                  isMuted
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white ring-rose-500 hover:from-rose-700 hover:to-rose-800'
                    : 'bg-white text-slate-800 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
                }`}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
                {isMuted ? 'Unmute' : 'Mute'}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={toggleVideo}
                className={`group relative inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-md ring-1 transition-all active:scale-95 ${
                  isVideoOff
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white ring-amber-400 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-white text-slate-800 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
                }`}
                aria-label={isVideoOff ? "Turn camera on" : "Turn camera off"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isVideoOff ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  )}
                </svg>
                {isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="group relative inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-md ring-1 bg-white text-slate-800 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 transition-all active:scale-95"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isFullscreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" transform="scale(0.7) translate(5, 5)" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  )}
                </svg>
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 active:scale-95 transition-all ring-2 ring-rose-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
                End Call
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Incoming Call Modal */}
      {showIncomingCallModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-slate-900/70 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-6">
              {/* Animated Call Icon */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-ping opacity-75" />
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-24 h-24 flex items-center justify-center shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>

              {/* Call Info */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Incoming Call
                </h3>
                <p className="text-slate-600 font-medium mb-1">
                  {userRole === "teacher" ? studentsName : teachersName}
                </p>
                <p className="text-sm text-slate-500">
                  Lesson: {lessonName}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-6 justify-center pt-2">
                <button
                  onClick={declineCall}
                  className="group relative flex flex-col items-center gap-2 transition-transform active:scale-95"
                  aria-label="Decline call"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-full shadow-xl transition-all">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600 font-semibold">Decline</span>
                </button>

                <button
                  onClick={acceptCall}
                  className="group relative flex flex-col items-center gap-2 transition-transform active:scale-95"
                  aria-label="Accept call"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-xl transition-all">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600 font-semibold">Accept</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}