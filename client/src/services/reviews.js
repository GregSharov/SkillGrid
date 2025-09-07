import API_URL from "./apiBase";
const API = API_URL;

// Fetch reviews for a specific teacher by their ID.
export async function getTeacherReviews(teacherId) {
  const res = await fetch(`${API}/reviews/teacher/${teacherId}`, {
    credentials: "include",
  });
  // if (!res.ok) throw new Error("Failed to fetch reviews");
  if (!res.ok) {
    return { avg: 0, count: 0, items: [] };
  }
  return res.json(); // { avg, count, items }
}

export async function getMyReview(teacherId) {
  const res = await fetch(`${API}/reviews/me/teacher/${teacherId}`, {
    credentials: "include",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to fetch my review");
  return res.json(); // review or null
}

export async function upsertReview({ teacherId, rating, comment }) {
  const res = await fetch(`${API}/reviews`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherId, rating, comment }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to save review");
  }
  return res.json(); // { message, review, stats }
}

export async function deleteReview(id) {
  const res = await fetch(`${API}/reviews/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete review");
  return res.json();
}
