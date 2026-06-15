const Recruiter = require("../models/Recruiter");
const Job = require("../models/Job");
const Application = require("../models/Application");

exports.getRecruiter = async (req, res) => {
  const recruiter = await Recruiter.findById(req.params.id).populate("userId", "name email role status");
  if (!recruiter) {
    return res.status(404).json({ message: "Recruiter not found" });
  }
  res.json(recruiter);
};

exports.updateRecruiter = async (req, res) => {
  const recruiter = await Recruiter.findById(req.params.id);
  if (!recruiter) {
    return res.status(404).json({ message: "Recruiter not found" });
  }

  const updates = ["companyName", "companyWebsite", "companyLogoUrl", "industry", "location", "phone", "description", "verified", "verificationStatus"];
  updates.forEach((field) => {
    if (req.body[field] !== undefined) recruiter[field] = req.body[field];
  });

  await recruiter.save();
  res.json({ message: "Recruiter updated", recruiter });
};

exports.getRecruiterJobs = async (req, res) => {
  const jobs = await Job.find({ recruiterId: req.params.id }).sort({ createdAt: -1 });
  res.json(jobs);
};

exports.getRecruiterApplications = async (req, res) => {
  const recruiterId = req.params.id;
  const jobs = await Job.find({ recruiterId }).select("_id");
  const jobIds = jobs.map((job) => job._id);
  const applications = await Application.find({ jobId: { $in: jobIds } }).populate("jobId candidateId resumeId").sort({ appliedAt: -1 });
  res.json(applications);
};
