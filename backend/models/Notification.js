const mongoose = require("mongoose");

const FlexibleId = mongoose.Schema.Types.Mixed;

const NotificationSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    userId: { type: FlexibleId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "welcome",
        "profile_incomplete",
        "profile_completed",
        "resume_uploaded",
        "resume_analyzed",
        "ats_score_improved",
        "new_matching_job",
        "high_relevance_job",
        "deadline_approaching",
        "application_received",
        "application_submitted",
        "application_viewed",
        "application_shortlisted",
        "application_rejected",
        "application_accepted",
        "status_update",
        "interview_invite",
        "interview_scheduled",
        "interview_updated",
        "interview_reminder",
        "interview_completed",
        "new_message",
        "unread_messages",
        "offer",
        "rejection",
        "general",
        "announcement",
      ],
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
