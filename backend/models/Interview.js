const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  candidateId: { type: String, required: true, index: true },
  candidateName: String,
  recruiterId: { type: String, index: true },
  jobId: { type: String, required: true, index: true },
  jobTitle: String,
  date: String,
  time: String,
  status: {
    type: String,
    enum: ["pending", "scheduled", "completed", "selected", "rejected"],
    default: "pending",
    index: true,
  },
  meetingLink: String,
  feedback: String,
}, { timestamps: true });

module.exports = mongoose.model("Interview", InterviewSchema);
