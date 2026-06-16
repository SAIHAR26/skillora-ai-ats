const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  title: { type: String, required: true, index: true },
  company: { type: String, required: true, index: true },
  recruiterId: { type: String, index: true },
  location: String,
  type: { type: String, enum: ["Remote", "Hybrid", "On-site"], default: "Remote" },
  salary: String,
  description: String,
  skills: [String],
  experience: String,
  deadline: String,
  status: { type: String, enum: ["active", "paused", "closed"], default: "active", index: true },
  applications: { type: Number, default: 0 },
  shortlisted: { type: Number, default: 0 },
  interviewed: { type: Number, default: 0 },
  hired: { type: Number, default: 0 },
  postedDate: String,
}, { timestamps: true });

JobSchema.index({ title: "text", company: "text", skills: "text", location: "text" });

module.exports = mongoose.model("Job", JobSchema);
