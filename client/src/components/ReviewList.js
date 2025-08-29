import { useEffect, useState } from "react";
import RatingStars from "./RatingStars.js";
import { getTeacherReviews } from "../services/reviews.js";

export default function ReviewsList({ teacherId, refreshKey }) {
  const [data, setData] = useState({ avg: 0, count: 0, items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const r = await getTeacherReviews(teacherId);
        if (mounted) setData(r);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [teacherId, refreshKey]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">Loading reviews…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <RatingStars value={data.avg} size="text-2xl" />
            <span className="text-2xl font-bold text-gray-900">
              {data.avg.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {data.count} review{data.count === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <ul className="space-y-4">
        {data.items.map((r) => (
          <li key={r._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RatingStars value={r.rating} />
                <span className="text-sm text-gray-600">
                  {r.student
                    ? `${r.student.firstName} ${r.student.lastName}`
                    : "Student"}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
            {r.comment && <p className="mt-2 text-gray-700">{r.comment}</p>}
          </li>
        ))}

        {data.items.length === 0 && (
          <li className="text-gray-500">No reviews yet.</li>
        )}
      </ul>
    </div>
  );
}
