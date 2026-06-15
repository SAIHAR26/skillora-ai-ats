const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Recruiter = require("../models/Recruiter");
const Candidate = require("../models/Candidate");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "skillora-secret", { expiresIn: "7d" });
};

exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password and role are required" });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const status = role === "recruiter" ? "pending" : "active";

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    status,
    profileCompleted: false,
  });

  if (role === "recruiter") {
    await Recruiter.create({ userId: user._id, verified: false, verificationStatus: "pending" });
  }

  if (role === "candidate") {
    await Candidate.create({ userId: user._id, skills: [], preferredJobTypes: [], preferredLocations: [], resumeIds: [] });
  }

  return res.status(201).json({ message: "Signup successful", token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.status !== "active") {
    return res.status(403).json({ message: "Account is not active" });
  }

  user.lastLoginAt = new Date();
  await user.save();

  return res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
};

exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();

  await user.save();

  return res.json({ message: "Profile updated", user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
};

exports.logout = async (req, res) => {
  return res.json({ message: "Logout successful" });
};
