// Clean, safe API base
// Prefer explicit env. Otherwise, default to current host on port 3000
// so that devices on the same LAN can reach the API.
let API_URL = process.env.REACT_APP_API_URL;

if (!API_URL && typeof window !== "undefined") {
  const proto = window.location.protocol || "http:";
  const host = window.location.hostname || "localhost";
  API_URL = `${proto}//${host}:3000`;
}

export default API_URL;
