const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "skillora-secret";

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, stored) {
  if (!password || !stored) return false;
  if (stored.startsWith("$2")) {
    return bcrypt.compareSync(password, stored);
  }
  return password === stored;
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_error) {
    return null;
  }
}

module.exports = {
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken,
};
