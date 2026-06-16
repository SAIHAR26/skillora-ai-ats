const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  candidateId: { type: String, required: true, index: true },
  candidateName: { type: String, required: true },
  jobId: { type: String, required: true, index: true },
  jobTitle: { type: String, required: true },
  company: String,
  atsScore: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ["applied", "under_review", "shortlisted", "interview", "selected", "rejected"],
    default: "applied",
    index: true,
  },
  appliedDate: String,
  resumeUrl: String,
}, { timestamps: true });

ApplicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Application", ApplicationSchema);
