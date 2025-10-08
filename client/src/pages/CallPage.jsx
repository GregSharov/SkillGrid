import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
// import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import API_URL from '../services/apiBase';

// Function to generate short UUID
// function generateShortUuid() {
// return uuidv4().substring(0, 4).toUpperCase();
// }

export default function CallPage() {
  const { roomId, slotId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <header className="rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                <span className="text-indigo-600">Lesson</span> {lessonName}
              </h1>
              {/* <p className="text-sm text-slate-600 mt-1">
                {teachersName} is teaching you {lessonName}
              </p> */}
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {userRole === "student" ? `Teacher: ${teachersName}` : `Student: ${studentsName}`}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {userRole === "teacher" ? teachersName : studentsName}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                Status:
                <span className="ml-1 text-indigo-700">
                  {connected ? 'Connected' : myId ? 'Ready' : 'Connecting...'}
                </span>
              </span>
            </div>
          </div>
        </header>

        {/* Connection Info */}
        <section className="rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 p-6">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500 rounded-t-2xl -mt-6 mb-6" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                You
              </label>
              <div className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-sm font-mono text-slate-800 ring-1 ring-slate-200">
                {userRole === "teacher" ? teachersName : studentsName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Connect to
              </label>
              <div className="flex gap-3">
                <div className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-sm font-mono text-slate-800 ring-1 ring-slate-200">
                  {userRole === "teacher" ? studentsName : teachersName}
                </div>
                <button
                  className="rounded-2xl px-6 py-2 text-sm font-semibold text-white shadow-sm bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={callPeer}
                  disabled={!myId || connected || !remoteId}
                >
                  Call
                </button>
              </div>
            </div>
          </div>
        </section>

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
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200">
                You
              </div>
              {isVideoOff && (
                <div className="absolute inset-0 grid place-items-center bg-slate-900/70 text-white text-sm">
                  Camera off
                </div>
              )}
              {isMuted && (
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
              {!connected && (
                <div className="absolute inset-0 grid place-items-center bg-slate-900/70 text-white text-sm">
                  Waiting for peer to join...
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={toggleMute}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm ring-1 transition
                ${!isMuted
                  ? "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                  : "bg-rose-600 text-white ring-rose-500 hover:bg-rose-700"
                }`}
              aria-pressed={!isMuted ? "true" : "false"}
            >
              {!isMuted ? "Mute Mic" : "Unmute Mic"}
            </button>

            <button
              onClick={toggleVideo}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm ring-1 transition
                ${!isVideoOff
                  ? "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                  : "bg-amber-500 text-white ring-amber-400 hover:bg-amber-600"
                }`}
              aria-pressed={!isVideoOff ? "true" : "false"}
            >
              {!isVideoOff ? "Turn Camera Off" : "Turn Camera On"}
            </button>

            <button
              onClick={() => {
                if (peerRef.current) {
                  peerRef.current.destroy();
                }
                window.location.reload();
              }}
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition"
            >
              End Call
            </button>
          </div>
        </section>
      </div>

      {/* Incoming Call Modal */}
      {showIncomingCallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 max-w-md w-full p-8">
            <div className="text-center space-y-6">
              {/* Call Icon */}
              <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>

              {/* Call Info */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Incoming Call
                </h3>
                <p className="text-slate-600">
                  {incomingCall?.peer || 'Unknown caller'} is calling you
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={declineCall}
                  className="flex items-center justify-center w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-colors"
                  aria-label="Decline call"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <button
                  onClick={acceptCall}
                  className="flex items-center justify-center w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-colors"
                  aria-label="Accept call"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}