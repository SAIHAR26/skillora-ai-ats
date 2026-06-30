const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  senderId: { type: String, required: true, index: true },
  senderName: String,
  senderRole: String,
  recipientId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  attachments: [{ type: mongoose.Schema.Types.Mixed }],
  resumeUrl: { type: String, trim: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
