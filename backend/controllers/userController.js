const User = require("../models/User");
const { toClient } = require("../services/platformDataService");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password").lean();
  res.json({ users: users.map(toClient) });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password").lean();
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user: toClient(user) });
});

module.exports = {
  getMe,
  listUsers,
};
