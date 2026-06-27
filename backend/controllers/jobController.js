const mongoose = require("mongoose");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Recruiter = require("../models/Recruiter");
const { toClient } = require("../services/platformDataService");

const idFilter = (id) => (mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id });

async function recruiterIdsForUser(user) {
  if (!user || user.role !== "recruiter") return [];
  const recruiter = await Recruiter.findOne({ $or: [{ userId: user._id }, { email: user.email }] }).lean();
  return [String(user._id), recruiter?.id, recruiter?._id ? String(recruiter._id) : null].filter(Boolean);
}

exports.listJobs = async (req, res) => {
  const filters = { published: true, active: true };
  const { recruiterId, mine, status, location, employmentType, type, title, skill, search } = req.query;

  if (mine === "true" && req.user?.role === "recruiter") {
    filters.recruiterId = { $in: await recruiterIdsForUser(req.user) };
  } else if (recruiterId) {
    filters.recruiterId = recruiterId;
  }

  if (status) filters.status = status;
  if (location) filters.location = new RegExp(location, "i");
  if (employmentType) filters.employmentType = employmentType;
  if (type) filters.type = type;
  if (title) filters.title = new RegExp(title, "i");
  if (skill) filters.$or = [{ skillsRequired: { $in: [new RegExp(skill, "i")] } }, { skills: { $in: [new RegExp(skill, "i")] } }];
  if (search) {
    const rx = new RegExp(search, "i");
    filters.$or = [{ title: rx }, { company: rx }, { location: rx }, { skills: { $in: [rx] } }, { skillsRequired: { $in: [rx] } }];
  }

  const jobs = await Job.find(filters).sort({ createdAt: -1 });
  res.json({ jobs: jobs.map(toClient) });
};

exports.getJobs = exports.listJobs;

exports.getJobById = async (req, res) => {
  const job = await Job.findOne(idFilter(req.params.id));
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(toClient(job));
};

exports.createJob = async (req, res) => {
  const title = req.body.title;
  if (!title) return res.status(400).json({ message: "Job title is required" });

  const recruiterIds = await recruiterIdsForUser(req.user);
  const recruiter = req.user?.role === "recruiter"
    ? await Recruiter.findOne({ $or: [{ userId: req.user._id }, { email: req.user.email }] }).lean()
    : null;
  const recruiterId = req.body.recruiterId || recruiterIds[0];
  if (!recruiterId && req.user?.role !== "admin") {
    return res.status(400).json({ message: "Recruiter profile is required before posting jobs" });
  }

  const skills = Array.isArray(req.body.skills) ? req.body.skills : String(req.body.skills || req.body.skillsRequired || "").split(",").map((item) => item.trim()).filter(Boolean);
  const job = await Job.create({
    id: req.body.id || `job-${Date.now()}`,
    recruiterId,
    title,
    company: req.body.company || recruiter?.companyName || "",
    description: req.body.description,
    skills,
    skillsRequired: skills,
    experience: req.body.experience,
    experienceLevel: req.body.experienceLevel || req.body.experience,
    salary: req.body.salary,
    salaryRange: req.body.salaryRange || {},
    location: req.body.location,
    type: req.body.type || "Remote",
    employmentType: req.body.employmentType || req.body.type,
    deadline: req.body.deadline,
    applicationDeadline: req.body.applicationDeadline || req.body.deadline,
    published: true,
    status: req.body.status || "active",
    active: true,
    applications: 0,
    totalApplicants: 0,
    shortlisted: 0,
    interviewed: 0,
    hired: 0,
    postedDate: new Date().toISOString().slice(0, 10),
  });

  if (recruiter?._id) await Recruiter.updateOne({ _id: recruiter._id }, { $inc: { jobsPosted: 1 } });
  res.status(201).json({ message: "Job created", job: toClient(job) });
};

exports.updateJob = async (req, res) => {
  const job = await Job.findOne(idFilter(req.params.id));
  if (!job) return res.status(404).json({ message: "Job not found" });

  if (req.user?.role === "recruiter") {
    const allowed = await recruiterIdsForUser(req.user);
    if (!allowed.includes(String(job.recruiterId))) return res.status(403).json({ message: "You can update only your own jobs" });
  }

  ["title", "description", "experience", "experienceLevel", "salary", "salaryRange", "location", "employmentType", "type", "deadline", "applicationDeadline", "published", "status", "active"].forEach((field) => {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  });
  if (req.body.skills !== undefined || req.body.skillsRequired !== undefined) {
    const skills = Array.isArray(req.body.skills || req.body.skillsRequired) ? (req.body.skills || req.body.skillsRequired) : String(req.body.skills || req.body.skillsRequired || "").split(",").map((item) => item.trim()).filter(Boolean);
    job.skills = skills;
    job.skillsRequired = skills;
  }

  await job.save();
  res.json({ message: "Job updated", job: toClient(job) });
};

exports.deleteJob = async (req, res) => {
  const job = await Job.findOne(idFilter(req.params.id));
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (req.user?.role === "recruiter") {
    const allowed = await recruiterIdsForUser(req.user);
    if (!allowed.includes(String(job.recruiterId))) return res.status(403).json({ message: "You can delete only your own jobs" });
  }
  await job.deleteOne();
  res.json({ message: "Job deleted", job: toClient(job) });
};

exports.updateJobStatus = exports.updateJob;

exports.getJobApplications = async (req, res) => {
  const job = await Job.findOne(idFilter(req.params.id));
  if (!job) return res.status(404).json({ message: "Job not found" });
  const ids = [String(job._id), job.id].filter(Boolean);
  const applications = await Application.find({ jobId: { $in: ids } }).populate("candidateId resumeId").sort({ appliedAt: -1 });
  res.json({ applications: applications.map(toClient) });
};
