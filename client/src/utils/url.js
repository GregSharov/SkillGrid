const API_BASE =
  process.env.REACT_APP_API_BASE?.replace(/\/+$/, "") || window.location.origin;

/** Convert DB/legacy URLs to safe, absolute HTTPS URLs */
export function normalizeAssetUrl(input) {
  if (!input) return ""; // no image

  // Already absolute and not localhost
  try {
    const u = new URL(input);
    // if it's http->https, upgrade; if localhost, swap host to API_BASE
    if (u.host.includes("localhost")) {
      return API_BASE + u.pathname; // serve same path from your server
    }
    if (u.protocol === "http:") {
      u.protocol = "https:";
      return u.toString();
    }
    return u.toString();
  } catch {
    // relative path like "/images/teachers/abc.png"
    if (input.startsWith("/")) return API_BASE + input;
    return API_BASE + "/" + input;
  }
}
