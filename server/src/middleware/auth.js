const { verifyAuthToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  try {
    const payload = verifyAuthToken(token);
    req.user = { userId: payload.userId, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired session. Please sign in again." });
  }
}

function requireRole(...allowedRoles) {
  return [
    requireAuth,
    (req, res, next) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
      }
      next();
    },
  ];
}

module.exports = { requireAuth, requireRole };
