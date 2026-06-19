const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");
const { hashPassword, signToken, verifyPassword } = require("../services/authService");
const { toClient } = require("../services/platformDataService");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

const publicUser = (user) => {
  const value = toClient(user);
  delete value.password;
  return value;
};

const register = asyncHandler(async (req, res) => {
  const { role = "candidate", password } = req.body;
  const email = req.body.email || req.body.personalEmail || req.body.companyEmail;
  const name = req.body.name || req.body.fullName;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, email, and password are required" });
    return;
  }

  if (!["candidate", "recruiter"].includes(role)) {
    res.status(400).json({ message: "Only candidate and recruiter self-registration is allowed" });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ message: "An account with this email already exists" });
    return;
  }

  const status = role === "recruiter" ? "pending" : "active";
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, password: passwordHash, role, status });

  if (role === "candidate") {
    await Candidate.create({
      userId: user._id,
      id: `cand-${String(user._id).slice(-6)}`,
      name,
      email,
      phone: req.body.phone,
      college: req.body.college,
      degree: req.body.degree,
      specialization: req.body.specialization,
      graduationYear: req.body.graduationYear,
      cgpa: Number(req.body.cgpa) || undefined,
      skills: String(req.body.skills || "").split(",").map((skill) => skill.trim()).filter(Boolean),
      education: [req.body.degree, req.body.college].filter(Boolean),
      experienceLevel: req.body.experienceLevel,
      atsScore: 0,
      location: req.body.currentLocation,
      preferredLocation: req.body.preferredLocation,
      workPreference: req.body.workPreference,
      linkedin: req.body.linkedin,
      github: req.body.github,
      appliedJobs: [],
      status: "active",
    });
  } else {
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
      experience: req.body.experience,
      linkedin: req.body.linkedin,
      status: "pending",
    });
  }

  const token = signToken({ id: String(user._id), role: user.role, email: user.email });
  res.status(201).json({ token, user: publicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await User.findOne({ email });
  const passwordMatches = user ? await verifyPassword(password, user.password) : false;
  if (!user || (role && user.role !== role) || !passwordMatches) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = signToken({ id: String(user._id), role: user.role, email: user.email });
  res.json({ token, user: publicUser(user) });
});

module.exports = {
  login,
  register,
};
