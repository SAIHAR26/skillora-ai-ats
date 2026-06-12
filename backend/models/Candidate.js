const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  skills: [String],
  education: [String],
  projects: [String],
  resumeUrl: String,
}, { timestamps: true });

module.exports = mongoose.model("Candidate", CandidateSchema);