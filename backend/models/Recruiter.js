const mongoose = require("mongoose");

const RecruiterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  id: { type: String, unique: true, sparse: true },
  name: String,
  email: { type: String, index: true },
  companyEmail: String,
  phone: String,
  avatar: String,
  companyName: String,
  companyAddress: String,
  companyWebsite: String,
  companyDescription: String,
  industry: String,
  companySize: String,
  role: String,
  experience: String,
  linkedin: String,
  location: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  jobsPosted: { type: Number, default: 0 },
  totalApplications: { type: Number, default: 0 },
  hiredCount: { type: Number, default: 0 },
}, { timestamps: true });

RecruiterSchema.index({ name: "text", email: "text", companyName: "text", industry: "text" });

module.exports = mongoose.model("Recruiter", RecruiterSchema);
