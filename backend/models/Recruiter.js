const mongoose = require("mongoose");

const FlexibleId = mongoose.Schema.Types.Mixed;

const RecruiterSchema = new mongoose.Schema(
  {
    userId: { type: FlexibleId, ref: "User", index: true },
    id: { type: String, unique: true, sparse: true },
    name: { type: String, trim: true },
    email: { type: String, index: true, lowercase: true, trim: true },
    age: { type: Number },
    phone: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    avatar: { type: String, trim: true },
    personalEmail: { type: String, trim: true, lowercase: true },
    linkedin: { type: String, trim: true },
    linkedinProfile: { type: String, trim: true },
    companyName: { type: String, trim: true },
    companyEmail: { type: String, trim: true, lowercase: true },
    companyAddress: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    companyLogoUrl: { type: String, trim: true },
    companyDescription: { type: String, trim: true },
    companySize: { type: String, trim: true },
    companyId: { type: String, trim: true },
    industry: { type: String, trim: true },
    role: { type: String, trim: true },
    roleInCompany: { type: String, trim: true },
    experience: { type: String, trim: true },
    yearsOfExperience: { type: Number, default: 0 },
    location: { type: String, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "active"], default: "pending", index: true },
    verified: { type: Boolean, default: false },
    verificationStatus: { type: String, default: "pending", enum: ["pending", "approved", "rejected"] },
    jobsPosted: { type: Number, default: 0 },
    totalApplications: { type: Number, default: 0 },
    hiredCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RecruiterSchema.index({ name: "text", email: "text", companyName: "text", industry: "text" });

module.exports = mongoose.model("Recruiter", RecruiterSchema);
