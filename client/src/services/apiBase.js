// Clean, safe API base
const API_URL = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

export const apiUrl = (path = "") =>
  `${API_URL}/${String(path).replace(/^\/+/, "")}`;

// Convenience wrappers
export async function apiGet(path, init) {
  const res = await fetch(apiUrl(path), { credentials: "include", ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
}

export default API_URL;
