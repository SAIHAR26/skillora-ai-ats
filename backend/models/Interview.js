const mongoose = require("mongoose");

const FlexibleId = mongoose.Schema.Types.Mixed;

const InterviewSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    applicationId: { type: FlexibleId, ref: "Application" },
    jobId: { type: FlexibleId, ref: "Job", required: true, index: true },
    jobTitle: { type: String, trim: true },
    candidateId: { type: FlexibleId, ref: "Candidate", required: true, index: true },
    candidateName: { type: String, trim: true },
    recruiterId: { type: FlexibleId, ref: "Recruiter", index: true },
    scheduledAt: { type: Date },
    date: { type: String },
    time: { type: String },
    durationMinutes: { type: Number, default: 30 },
    mode: { type: String, enum: ["online", "offline", "phone"], default: "online" },
    location: { type: String, trim: true },
    meetingLink: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "scheduled", "completed", "cancelled", "selected", "rejected"],
      default: "scheduled",
      index: true,
    },
    feedback: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", InterviewSchema);
