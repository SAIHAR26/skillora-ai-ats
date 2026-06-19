const mongoose = require("mongoose");

const VerificationDocumentSchema = new mongoose.Schema({
  filename: { type: String },
  url: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    password: { type: String, select: false },
    role: { type: String, required: true, enum: ["admin", "recruiter", "candidate"] },
    status: {
      type: String,
      default: "active",
      enum: ["pending", "active", "approved", "rejected", "blocked", "suspended"],
    },
    profileCompleted: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    verificationDocuments: [VerificationDocumentSchema],
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model("User", UserSchema);
