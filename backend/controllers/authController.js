const User = require("../models/User");
const Recruiter = require("../models/Recruiter");
const Candidate = require("../models/Candidate");
const { hashPassword, signToken, verifyPassword } = require("../services/authService");
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

const buildToken = (user) => signToken({ id: String(user._id), role: user.role, email: user.email });

const signup = asyncHandler(async (req, res) => {
  const { role = "candidate", password } = req.body;
  const email = (req.body.email || req.body.personalEmail || req.body.companyEmail || "").toLowerCase();
  const name = req.body.name || req.body.fullName;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  if (!["candidate", "recruiter"].includes(role)) {
    return res.status(400).json({ message: "Only candidate and recruiter self-registration is allowed" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const status = role === "recruiter" ? "pending" : "active";
  const passwordHash = hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    status,
    profileCompleted: false,
  });

  if (role === "candidate") {
    await Candidate.create({
      userId: user._id,
      id: `cand-${String(user._id).slice(-6)}`,
      name,
      email,
      phone: req.body.phone,
      phoneNumber: req.body.phoneNumber || req.body.phone,
      college: req.body.college,
      degree: req.body.degree,
      specialization: req.body.specialization,
      graduationYear: req.body.graduationYear,
      cgpa: Number(req.body.cgpa) || undefined,
      skills: String(req.body.skills || "").split(",").map((skill) => skill.trim()).filter(Boolean),
      education: [req.body.degree, req.body.college].filter(Boolean),
      experienceLevel: req.body.experienceLevel,
      atsScore: 0,
      currentLocation: req.body.currentLocation,
      location: req.body.currentLocation || req.body.location,
      preferredLocation: req.body.preferredLocation,
      preferredLocations: req.body.preferredLocation ? [req.body.preferredLocation] : [],
      workPreference: req.body.workPreference,
      preferredJobTypes: [],
      linkedin: req.body.linkedin,
      github: req.body.github,
      appliedJobs: [],
      resumeIds: [],
      status: "active",
    });
  }

  if (role === "recruiter") {
    await Recruiter.create({
      userId: user._id,
      id: `rec-${String(user._id).slice(-6)}`,
      name,
      email,
      companyEmail: req.body.companyEmail,
      phone: req.body.phone,
      companyName: req.body.companyName,
      companyAddress: req.body.companyAddress,
      companyWebsite: req.body.companyWebsite,
      industry: req.body.industry,
      companySize: req.body.companySize,
      role: req.body.companyRole || req.body.role,
      roleInCompany: req.body.companyRole,
      experience: req.body.experience,
      linkedin: req.body.linkedin,
      status: "pending",
      verified: false,
      verificationStatus: "pending",
    });
  }

  return res.status(201).json({
    message: "Signup successful",
    token: buildToken(user),
    user: publicUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || (role && user.role !== role)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const storedPassword = user.passwordHash || user.password;
  if (!verifyPassword(password, storedPassword)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (["blocked", "suspended", "rejected"].includes(user.status)) {
    return res.status(403).json({ message: "Account is not active" });
  }

  user.lastLoginAt = new Date();
  await user.save();

  return res.json({ token: buildToken(user), user: publicUser(user) });
});

const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.json({ user: publicUser(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
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

  return res.json({ message: "Profile updated", user: publicUser(user) });
});

const logout = asyncHandler(async (_req, res) => {
  return res.json({ message: "Logout successful" });
});

module.exports = {
  getMe,
  login,
  logout,
  register: signup,
  signup,
  updateProfile,
};
