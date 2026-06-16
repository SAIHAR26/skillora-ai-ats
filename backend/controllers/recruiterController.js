const mongoose = require("mongoose");
const Recruiter = require("../models/Recruiter");
const Job = require("../models/Job");
const Application = require("../models/Application");
const { toClient } = require("../services/platformDataService");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const recruiterFilter = (id) => (mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id });

const listRecruiters = asyncHandler(async (req, res) => {
  const query = req.query.status ? { status: req.query.status } : {};
  const recruiters = await Recruiter.find(query).limit(100).lean();
  return res.json({ recruiters: recruiters.map(toClient) });
});

const getRecruiter = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne(recruiterFilter(req.params.id)).populate("userId", "name email role status");
  if (!recruiter) {
    return res.status(404).json({ message: "Recruiter not found" });
  }
  return res.json(recruiter);
});

const updateRecruiter = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne(recruiterFilter(req.params.id));
  if (!recruiter) {
    return res.status(404).json({ message: "Recruiter not found" });
  }

  const updates = [
    "name",
    "email",
    "phone",
    "phoneNumber",
    "companyName",
    "companyEmail",
    "companyAddress",
    "companyWebsite",
    "companyLogoUrl",
    "companyDescription",
    "companySize",
    "industry",
    "location",
    "role",
    "roleInCompany",
    "experience",
    "yearsOfExperience",
    "linkedin",
    "linkedinProfile",
    "description",
    "verified",
    "verificationStatus",
    "status",
  ];

  updates.forEach((field) => {
    if (req.body[field] !== undefined) recruiter[field] = req.body[field];
  });

  await recruiter.save();
  return res.json({ message: "Recruiter updated", recruiter: toClient(recruiter) });
});

const updateRecruiterStatus = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne(recruiterFilter(req.params.id));
  if (!recruiter) {
    return res.status(404).json({ message: "Recruiter not found" });
  }

  if (req.body.status) recruiter.status = req.body.status;
  if (req.body.status === "approved") recruiter.verified = true;
  if (req.body.status === "rejected") recruiter.verified = false;
  recruiter.verificationStatus = req.body.status || recruiter.verificationStatus;
  await recruiter.save();

  return res.json({ recruiter: toClient(recruiter) });
});

const getRecruiterJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiterId: req.params.id }).sort({ createdAt: -1 });
  return res.json(jobs);
});

const getRecruiterApplications = asyncHandler(async (req, res) => {
  const recruiterId = req.params.id;
  const jobs = await Job.find({ recruiterId }).select("_id id");
  const jobIds = jobs.flatMap((job) => [job._id, job.id].filter(Boolean));
  const applications = await Application.find({ jobId: { $in: jobIds } }).populate("jobId candidateId resumeId").sort({ appliedAt: -1 });
  return res.json(applications);
});

module.exports = {
  getRecruiter,
  getRecruiterApplications,
  getRecruiterJobs,
  listRecruiters,
  updateRecruiter,
  updateRecruiterStatus,
};
