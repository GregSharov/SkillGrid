import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function JoinCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      const t = setTimeout(() => {
        navigate(`/call/${encodeURIComponent(roomId)}`, { replace: true });
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [roomId, navigate]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-16 px-6">
      <div className="mx-auto max-w-md">
        <section
          className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500" />
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 grid place-items-center h-14 w-14 rounded-full bg-slate-50 ring-1 ring-slate-200">
              <svg
                className="h-7 w-7 animate-spin text-indigo-600"
                viewBox="0 0 24 24"
                role="status"
                aria-label="Connecting"
              >
                <circle
                  className="opacity-20"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Connecting to{" "}
              <span className="text-indigo-600">Room #{roomId}</span>
            </h1>
            <p className="mt-2 text-slate-600 text-sm">
              Preparing your call. You’ll be redirected automatically.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2">
              <Link
                to="/"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
              <button
                onClick={() =>
                  navigate(`/call/${encodeURIComponent(roomId)}`, {
                    replace: true,
                  })
                }
                className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition"
              >
                Join now
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              If nothing happens, click{" "}
              <span className="font-medium text-slate-700">Join now</span>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
