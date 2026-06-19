const mongoose = require("mongoose");

const FlexibleId = mongoose.Schema.Types.Mixed;

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
    userId: { type: FlexibleId, ref: "User", index: true },
    id: { type: String, unique: true, sparse: true },
    name: { type: String, trim: true },
    email: { type: String, index: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    avatar: { type: String, trim: true },
    headline: { type: String, trim: true },
    summary: { type: String, trim: true },
    college: { type: String, trim: true },
    degree: { type: String, trim: true },
    specialization: { type: String, trim: true },
    graduationYear: { type: mongoose.Schema.Types.Mixed },
    cgpa: { type: Number },
    currentLocation: { type: String, trim: true },
    location: { type: String, trim: true },
    preferredLocation: { type: String, trim: true },
    preferredLocations: [{ type: String, trim: true }],
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    experienceLevel: { type: String, trim: true },
    experienceYears: { type: Number, default: 0 },
    skills: [{ type: String, trim: true }],
    education: [mongoose.Schema.Types.Mixed],
    workExperience: [ExperienceSchema],
    projects: [mongoose.Schema.Types.Mixed],
    certifications: [CertificationSchema],
    preferredJobTypes: [{ type: String, trim: true }],
    workPreference: mongoose.Schema.Types.Mixed,
    resumeIds: [{ type: FlexibleId, ref: "Resume" }],
    resumeUrl: { type: String, trim: true },
    appliedJobs: [{ type: String }],
    atsScore: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
  },
  { timestamps: true }
);

CandidateSchema.index({ name: "text", email: "text", skills: "text", college: "text" });

module.exports = mongoose.model("Candidate", CandidateSchema);
