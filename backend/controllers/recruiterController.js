const mongoose = require("mongoose");
const Recruiter = require("../models/Recruiter");
const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const { toClient } = require("../services/platformDataService");
const { getRecruiterForUser, idVariants, ownsMixedId } = require("../services/accessControl");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const recruiterFilter = (id) => (mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id });

async function canAccessRecruiter(req, recruiter) {
  if (req.user?.role === "admin") return true;
  if (req.user?.role !== "recruiter") return false;
  const ownRecruiter = await getRecruiterForUser(req.user);
  return Boolean(ownRecruiter && (ownsMixedId([ownRecruiter._id, ownRecruiter.id], recruiter._id) || ownRecruiter.id === recruiter.id));
}

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
  if (!(await canAccessRecruiter(req, recruiter))) {
    return res.status(403).json({ message: "You cannot view another recruiter profile" });
  }
  return res.json(recruiter);
});

const updateRecruiter = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne(recruiterFilter(req.params.id));
  if (!recruiter) {
    return res.status(404).json({ message: "Recruiter not found" });
  }
  if (!(await canAccessRecruiter(req, recruiter))) {
    return res.status(403).json({ message: "You cannot update another recruiter profile" });
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

  if (recruiter.userId && mongoose.Types.ObjectId.isValid(recruiter.userId)) {
    await User.findByIdAndUpdate(recruiter.userId, {
      status: req.body.status === "rejected" ? "rejected" : req.body.status === "approved" ? "active" : req.body.status,
    });
  }

  return res.json({ recruiter: toClient(recruiter) });
});

const deleteRecruiter = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne(recruiterFilter(req.params.id));
  if (!recruiter) {
    return res.status(404).json({ message: "Recruiter not found" });
  }

  if (recruiter.userId && mongoose.Types.ObjectId.isValid(recruiter.userId)) {
    await User.findByIdAndDelete(recruiter.userId);
  }
  await recruiter.deleteOne();

  return res.json({ message: "Recruiter deleted" });
});

const getRecruiterJobs = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne(recruiterFilter(req.params.id));
  if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });
  if (!(await canAccessRecruiter(req, recruiter))) {
    return res.status(403).json({ message: "You cannot view another recruiter's jobs" });
  }
  const jobs = await Job.find({ recruiterId: { $in: idVariants(recruiter._id).concat(idVariants(recruiter.id)) } }).sort({ createdAt: -1 });
  return res.json(jobs);
});

const getRecruiterApplications = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne(recruiterFilter(req.params.id));
  if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });
  if (!(await canAccessRecruiter(req, recruiter))) {
    return res.status(403).json({ message: "You cannot view another recruiter's applications" });
  }
  const jobs = await Job.find({ recruiterId: { $in: idVariants(recruiter._id).concat(idVariants(recruiter.id)) } }).select("_id id");
  const jobIds = jobs.flatMap((job) => [job._id, job.id].filter(Boolean));
  const applications = await Application.find({ jobId: { $in: jobIds } }).populate("jobId candidateId resumeId").sort({ appliedAt: -1 });
  return res.json(applications);
});

const getRecruiterAnalytics = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne(recruiterFilter(req.params.id));
  if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });
  if (!(await canAccessRecruiter(req, recruiter))) {
    return res.status(403).json({ message: "You cannot view another recruiter's analytics" });
  }

  const recruiterIds = idVariants(recruiter._id).concat(idVariants(recruiter.id));
  const jobs = await Job.find({ recruiterId: { $in: recruiterIds } }).lean();
  const jobIds = jobs.flatMap((job) => idVariants(job._id).concat(idVariants(job.id))).filter(Boolean);
  const applications = await Application.find({ jobId: { $in: jobIds } }).lean();

  const activeStatuses = new Set(["open", "active"]);
  const interviewStatuses = new Set(["interview", "interview_scheduled"]);
  const totalApplications = applications.length;
  const selected = applications.filter((item) => item.status === "selected").length;
  const atsScores = applications.map((item) => Number(item.atsScore || item.score || 0)).filter((score) => score > 0);

  const applicationsByJob = applications.reduce((map, app) => {
    const key = String(app.jobId);
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {});

  return res.json({
    totalJobs: jobs.length,
    activeJobs: jobs.filter((job) => activeStatuses.has(job.status) && job.active !== false).length,
    closedJobs: jobs.filter((job) => job.status === "closed" || job.status === "archived").length,
    applicationsReceived: totalApplications,
    interviewScheduled: applications.filter((item) => interviewStatuses.has(item.status)).length,
    candidateConversionRate: totalApplications ? Number(((selected / totalApplications) * 100).toFixed(2)) : 0,
    atsAverageScore: atsScores.length ? Number((atsScores.reduce((sum, score) => sum + score, 0) / atsScores.length).toFixed(2)) : 0,
    topPerformingJobs: jobs
      .map((job) => ({
        id: String(job._id),
        title: job.title,
        status: job.status,
        applications: applicationsByJob[String(job._id)] || applicationsByJob[String(job.id)] || 0,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5),
  });
});

module.exports = {
  deleteRecruiter,
  getRecruiter,
  getRecruiterApplications,
  getRecruiterAnalytics,
  getRecruiterJobs,
  listRecruiters,
  updateRecruiter,
  updateRecruiterStatus,
};
