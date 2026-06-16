const mongoose = require("mongoose");

const FlexibleId = mongoose.Schema.Types.Mixed;

const SalaryRangeSchema = new mongoose.Schema({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
});

const JobSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    recruiterId: { type: FlexibleId, ref: "Recruiter", index: true },
    title: { type: String, required: true, trim: true, index: true },
    company: { type: String, trim: true, index: true },
    description: { type: String, trim: true },
    skillsRequired: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    experienceLevel: { type: String, trim: true },
    experience: { type: String, trim: true },
    salaryRange: SalaryRangeSchema,
    salary: { type: String, trim: true },
    location: { type: String, trim: true },
    employmentType: { type: String, trim: true },
    type: { type: String, enum: ["Remote", "Hybrid", "On-site"], default: "Remote" },
    applicationDeadline: { type: Date },
    deadline: { type: String },
    published: { type: Boolean, default: true },
    status: { type: String, enum: ["open", "closed", "archived", "active", "paused"], default: "open", index: true },
    totalApplicants: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    shortlisted: { type: Number, default: 0 },
    interviewed: { type: Number, default: 0 },
    hired: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    postedDate: { type: String },
  },
  { timestamps: true }
);

JobSchema.index({ title: "text", company: "text", skills: "text", skillsRequired: "text", location: "text" });

module.exports = mongoose.model("Job", JobSchema);
