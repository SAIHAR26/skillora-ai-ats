const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");
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

const userFilter = (id) => (id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { id });

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne(userFilter(req.params.id)).select("-passwordHash -password");
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
  const user = await User.findOne(userFilter(req.params.id));
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (status) user.status = status;
  await user.save();
  return res.json({ message: "User status updated", user: publicUser(user) });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOne(userFilter(req.params.id));
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await Promise.all([
    Candidate.deleteMany({ $or: [{ userId: user._id }, { email: user.email }] }),
    Recruiter.deleteMany({ $or: [{ userId: user._id }, { email: user.email }] }),
  ]);
  await user.deleteOne();

  return res.json({ message: "User deleted" });
});

module.exports = {
  deleteUser,
  getMe,
  getUserById,
  getUsers,
  listUsers,
  updateUserStatus,
};
