const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  userId: { type: String, required: true, index: true },
  userName: String,
  userRole: String,
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["open", "resolved"], default: "open", index: true },
  createdAt: { type: String, default: () => new Date().toISOString().slice(0, 10) },
}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);
