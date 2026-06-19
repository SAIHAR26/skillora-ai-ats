const User = require("../models/User");
const { verifyToken } = require("../services/authService");

async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Not authorized, token invalid or missing" });
  }

  try {
    const userId = payload.id || payload._id;
    const user = userId ? await User.findById(userId).select("-passwordHash -password") : null;

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    req.auth = payload;
    return next();
  } catch (error) {
    return next(error);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient privileges" });
    }
    return next();
  };
}

module.exports = {
  authorize,
  protect,
  requireAuth: protect,
  requireRole: authorize,
};
