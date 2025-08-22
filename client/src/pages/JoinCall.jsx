import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinCall() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Join a Lesson</h1>
      <input
        className="w-full border rounded p-2"
        placeholder="Enter room ID (e.g., math-101)"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && room && navigate(`/call/${encodeURIComponent(room)}`)}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => room && navigate(`/call/${encodeURIComponent(room)}`)}
      >
        Join
      </button>
    </div>
  );
}
