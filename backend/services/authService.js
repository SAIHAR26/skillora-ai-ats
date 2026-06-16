const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "skillora-secret";

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  return bcrypt.compare(password, storedHash);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = {
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken,
};
