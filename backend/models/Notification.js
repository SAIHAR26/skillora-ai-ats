const mongoose = require("mongoose");

const FlexibleId = mongoose.Schema.Types.Mixed;

const NotificationSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    userId: { type: FlexibleId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["welcome", "application_received", "status_update", "interview_invite", "offer", "rejection", "general"],
      default: "general",
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["unread", "read"], default: "unread" },
    read: { type: Boolean, default: false },
    metadata: { type: Object, default: {} },
    sentAt: { type: Date, default: Date.now },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
