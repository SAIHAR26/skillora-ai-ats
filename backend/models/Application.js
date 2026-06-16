const mongoose = require("mongoose");

const FlexibleId = mongoose.Schema.Types.Mixed;

const ApplicationSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    candidateId: { type: FlexibleId, ref: "Candidate", required: true, index: true },
    candidateName: { type: String, trim: true },
    jobId: { type: FlexibleId, ref: "Job", required: true, index: true },
    jobTitle: { type: String, trim: true },
    company: { type: String, trim: true },
    resumeId: { type: FlexibleId, ref: "Resume" },
    resumeUrl: { type: String, trim: true },
    atsScore: { type: Number, default: 0, min: 0, max: 100 },
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["applied", "under_review", "shortlisted", "interview", "interview_scheduled", "selected", "rejected"],
      default: "applied",
      index: true,
    },
    appliedAt: { type: Date, default: Date.now },
    appliedDate: { type: String },
    updatedAt: { type: Date, default: Date.now },
    remarks: { type: String, trim: true },
    aiResultId: { type: FlexibleId, ref: "AIResult" },
  },
  { timestamps: true }
);

ApplicationSchema.index({ candidateId: 1, jobId: 1 });

module.exports = mongoose.model("Application", ApplicationSchema);
