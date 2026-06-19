const mongoose = require("mongoose");

const FlexibleId = mongoose.Schema.Types.Mixed;

const ComplaintSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    userId: { type: FlexibleId, ref: "User", required: true, index: true },
    userName: { type: String, trim: true },
    userRole: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, enum: ["technical", "recruiter", "candidate", "payment", "other"], default: "other" },
    status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open", index: true },
    assignedTo: { type: FlexibleId, ref: "User" },
    createdAtLabel: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
