const User = require("../models/User");
const { toClient } = require("../services/platformDataService");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const publicUser = (user) => {
  const value = toClient(user);
  delete value.password;
  delete value.passwordHash;
  return value;
};

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash -password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(publicUser(user));
});

const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-passwordHash -password").lean();
  return res.json(users.map(publicUser));
});

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-passwordHash -password").lean();
  return res.json({ users: users.map(publicUser) });
});

const getMe = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const user = await User.findById(userId).select("-passwordHash -password").lean();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({ user: publicUser(user) });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (status) user.status = status;
  await user.save();
  return res.json({ message: "User status updated", user: publicUser(user) });
});

module.exports = {
  getMe,
  getUserById,
  getUsers,
  listUsers,
  updateUserStatus,
};
