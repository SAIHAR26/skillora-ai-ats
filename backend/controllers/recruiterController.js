const Recruiter = require("../models/Recruiter");
const bcrypt = require("bcryptjs");


// ---------------- SIGNUP ----------------
exports.signup = async (req, res) => {
  try {
    const {
      name,
      age,
      phoneNumber,
      personalEmail,
      companyEmail,
      companyName,
      companyAddress,
      companyWebsite,
      industryType,
      companySize,
      roleInCompany,
      yearsOfExperience,
      linkedinProfile,
      companyId,
      password,
      location,
    } = req.body;

    // check existing recruiter
    const existing = await Recruiter.findOne({ personalEmail });
    if (existing) {
      return res.status(400).json({ message: "Recruiter already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const recruiter = await Recruiter.create({
      name,
      age,
      phoneNumber,
      personalEmail,
      companyEmail,
      companyName,
      companyAddress,
      companyWebsite,
      industryType,
      companySize,
      roleInCompany,
      yearsOfExperience,
      linkedinProfile,
      companyId,
      password: hashedPassword,
      location,
      verificationStatus: "pending",
    });

    res.status(201).json({
      message: "Recruiter registered successfully",
      recruiter,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { personalEmail, password } = req.body;

    const recruiter = await Recruiter.findOne({ personalEmail });

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const isMatch = await bcrypt.compare(password, recruiter.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (recruiter.verificationStatus !== "approved") {
      return res.status(403).json({
        message: "Recruiter not approved by admin yet",
      });
    }

    res.status(200).json({
      message: "Login successful",
      recruiter,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ---------------- PROFILE ----------------
exports.getProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    res.status(200).json(recruiter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await Recruiter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};