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
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "recruiter", "candidate"] },
    status: { type: String, default: "pending", enum: ["pending", "active", "blocked"] },
    profileCompleted: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    verificationDocuments: [VerificationDocumentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);