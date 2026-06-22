const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    singletonKey: { type: String, default: "primary", enum: ["primary"], unique: true },
    // Personal Information
    phoneNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    // Admin Privileges
    permissions: [
      {
        type: String,
        enum: [
          "manage_recruiters",
          "manage_candidates",
          "manage_jobs",
          "manage_complaints",
          "manage_opportunities",
          "view_analytics",
          "manage_admins",
        ],
      },
    ],
    adminLevel: { type: String, enum: ["super_admin", "admin"], default: "admin" },
    // Status
    isActive: { type: Boolean, default: true },
    // Notes
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

AdminSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("Admin", AdminSchema);
