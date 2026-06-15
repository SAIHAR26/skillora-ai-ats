const mongoose = require("mongoose");

const EducationSchema = new mongoose.Schema({
  college: { type: String, trim: true },
  institution: { type: String, trim: true },
  degree: { type: String, trim: true },
  specialization: { type: String, trim: true },
  field: { type: String, trim: true },
  graduationYear: { type: Number },
  cgpa: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
});

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, trim: true },
  title: { type: String, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, trim: true },
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  description: { type: String, trim: true },
  link: { type: String, trim: true },
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  issuer: { type: String, trim: true },
  date: { type: Date },
  credentialUrl: { type: String, trim: true },
});

const CandidateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Personal Information
    phoneNumber: { type: String, trim: true },
    headline: { type: String, trim: true },
    summary: { type: String, trim: true },
    // Location Information
    currentLocation: { type: String, trim: true },
    location: { type: String, trim: true },
    preferredLocations: [{ type: String, trim: true }],
    // Profile Links
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    // Experience & Skills
    experienceLevel: { type: String, trim: true },
    experienceYears: { type: Number, default: 0 },
    skills: [{ type: String, trim: true }],
    // Education
    education: [EducationSchema],
    workExperience: [ExperienceSchema],
    projects: [ProjectSchema],
    certifications: [CertificationSchema],
    // Job Preferences
    preferredJobTypes: [{ type: String, trim: true }],
    workPreference: [{ type: String, trim: true }],
    // Resume & Documents
    resumeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resume" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", CandidateSchema);