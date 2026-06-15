const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    status: {
      type: String,
      enum: ["applied", "under_review", "interview_scheduled", "selected", "rejected", "shortlisted"],
      default: "applied",
    },
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    remarks: { type: String, trim: true },
    aiResultId: { type: mongoose.Schema.Types.ObjectId, ref: "AIResult" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);
