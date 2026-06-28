const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  url: { type: String, trim: true },
  type: { type: String, trim: true },
  size: Number,
  contentType: { type: String, trim: true },
  kind: { type: String, enum: ["file", "resume"], default: "file" },
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  senderId: { type: String, required: true, index: true },
  senderName: String,
  senderRole: String,
  recipientId: { type: String, required: true, index: true },
  recipientRole: String,
  content: { type: String, required: true },
  attachments: [AttachmentSchema],
  resumeShared: { type: Boolean, default: false },
  timestamp: { type: String, default: () => new Date().toISOString() },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

MessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);