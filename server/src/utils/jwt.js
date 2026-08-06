const jwt = require("jsonwebtoken");

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it to server/.env before starting the server.");
}

function signAuthToken({ userId, email, role }) {
  return jwt.sign({ userId, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN || "7d",
  });
}

function verifyAuthToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signAuthToken, verifyAuthToken };
