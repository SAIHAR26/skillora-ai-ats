const User = require("../models/User");

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};

exports.getUsers = async (req, res) => {
  const users = await User.find().select("-passwordHash");
  res.json(users);
};

exports.updateUserStatus = async (req, res) => {
  const { status } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (status) user.status = status;
  await user.save();
  res.json({ message: "User status updated", user });
};
