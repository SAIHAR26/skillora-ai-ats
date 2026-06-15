const mongoose = require("mongoose");

const SalaryRangeSchema = new mongoose.Schema({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
});

const JobSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    skillsRequired: [{ type: String, trim: true }],
    experienceLevel: { type: String, trim: true, enum: ["entry", "mid", "senior", "lead"], default: "mid" },
    salaryRange: SalaryRangeSchema,
    location: { type: String, trim: true },
    employmentType: { type: String, trim: true, enum: ["full-time", "part-time", "contract", "remote", "hybrid"], default: "full-time" },
    applicationDeadline: { type: Date },
    published: { type: Boolean, default: true },
    status: { type: String, default: "open", enum: ["open", "closed", "archived"] },
    totalApplicants: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
