export default function authMiddleware(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user; // { id, role, ... }
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}
