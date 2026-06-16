const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  id: { type: String, unique: true, sparse: true },
  name: String,
  email: { type: String, index: true },
  phone: String,
  avatar: String,
  college: String,
  degree: String,
  specialization: String,
  graduationYear: String,
  cgpa: Number,
  skills: [String],
  education: [String],
  projects: [String],
  experienceLevel: String,
  atsScore: { type: Number, default: 0 },
  location: String,
  preferredLocation: String,
  workPreference: String,
  linkedin: String,
  github: String,
  resumeUrl: String,
  appliedJobs: [String],
  status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
}, { timestamps: true });

CandidateSchema.index({ name: "text", email: "text", skills: "text", college: "text" });

module.exports = mongoose.model("Candidate", CandidateSchema);
