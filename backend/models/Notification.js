const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["welcome", "application_received", "status_update", "interview_invite", "offer", "rejection", "general"],
      default: "general",
    },
    title: { type: String, trim: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ["unread", "read"], default: "unread" },
    metadata: { type: Object, default: {} },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
