import { useEffect, useState } from "react";
import RatingStars from "./RatingStars.js";
import {
  getMyReview,
  upsertReview,
  deleteReview,
} from "../services/reviews.js";

export default function ReviewForm({ teacherId, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null); // { _id, rating, comment }
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const r = await getMyReview(teacherId);
        if (!mounted) return;
        setMyReview(r);
        setRating(r?.rating || 0);
        setComment(r?.comment || "");
      } catch (e) {
        // ignore 401 here — user may be logged out
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [teacherId]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await upsertReview({ teacherId, rating, comment });
      setMyReview(res.review);
      if (onSaved) onSaved(res.stats); // { avg, count }
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async () => {
    if (!myReview?._id) return;
    if (!window.confirm("Delete your review?")) return;
    setError("");
    try {
      await deleteReview(myReview._id);
      setMyReview(null);
      setRating(0);
      setComment("");
      if (onSaved) onSaved(); // trigger reload
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {myReview ? "Edit your review" : "Leave a review"}
      </h3>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Your rating:</span>
            <RatingStars value={rating} onChange={setRating} size="text-2xl" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="How was your lesson?"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1"
              disabled={!rating}
            >
              {myReview ? "Update review" : "Submit review"}
            </button>

            {myReview && (
              <button
                type="button"
                onClick={remove}
                className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 font-medium shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
