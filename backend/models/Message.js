const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  size: Number,
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  senderId: { type: String, required: true, index: true },
  senderName: String,
  senderRole: String,
  recipientId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  attachments: [AttachmentSchema],
  resumeShared: { type: Boolean, default: false },
  timestamp: { type: String, default: () => new Date().toISOString() },
  read: { type: Boolean, default: false },
}, { timestamps: true });

MessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);
