// client/src/config/api.js
const ENV =
  (typeof import.meta !== "undefined" ? import.meta.env : process.env) || {};
const API_URL = (
  ENV.VITE_API_URL ||
  ENV.REACT_APP_API_URL ||
  `http://${window.location.hostname}:3000`
).replace(/\/$/, "");
export default API_URL;
