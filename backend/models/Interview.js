const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 30 },
    mode: { type: String, enum: ["online", "offline", "phone"], default: "online" },
    location: { type: String, trim: true },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    feedback: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", InterviewSchema);
