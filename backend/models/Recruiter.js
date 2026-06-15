const mongoose = require("mongoose");

const RecruiterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Personal Information
    age: { type: Number },
    phoneNumber: { type: String, trim: true },
    personalEmail: { type: String, trim: true, lowercase: true },
    linkedinProfile: { type: String, trim: true },
    // Company Information
    companyName: { type: String, trim: true },
    companyEmail: { type: String, trim: true, lowercase: true },
    companyAddress: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    companyLogoUrl: { type: String, trim: true },
    companySize: { type: String, trim: true },
    companyId: { type: String, trim: true },
    industry: { type: String, trim: true },
    roleInCompany: { type: String, trim: true },
    yearsOfExperience: { type: Number, default: 0 },
    // Additional Fields
    description: { type: String, trim: true },
    verified: { type: Boolean, default: false },
    verificationStatus: { type: String, default: "pending", enum: ["pending", "approved", "rejected"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruiter", RecruiterSchema);