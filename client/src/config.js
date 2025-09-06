// src/config.js
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";
export const SIGNALING_URL = process.env.REACT_APP_SIGNALING_URL || "http://localhost:4000";
export const IMAGE_BASE = process.env.REACT_APP_IMAGE_BASE || API_BASE;
