const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: { type: String, enum: ["technical", "recruiter", "candidate", "payment", "other"], default: "other" },
    status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
