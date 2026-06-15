const Job = require("../models/Job");
const Application = require("../models/Application");

exports.listJobs = async (req, res) => {
  const filters = { published: true, active: true };
  const { recruiterId, status, location, employmentType, title, skill } = req.query;

  if (recruiterId) filters.recruiterId = recruiterId;
  if (status) filters.status = status;
  if (location) filters.location = new RegExp(location, "i");
  if (employmentType) filters.employmentType = employmentType;
  if (title) filters.title = new RegExp(title, "i");
  if (skill) filters.skillsRequired = { $in: [new RegExp(skill, "i")] };

  const jobs = await Job.find(filters).sort({ createdAt: -1 });
  res.json(jobs);
};

exports.getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  res.json(job);
};

exports.createJob = async (req, res) => {
  const { recruiterId, title, description, skillsRequired, salaryRange, location, employmentType, applicationDeadline } = req.body;

  if (!recruiterId || !title) {
    return res.status(400).json({ message: "Recruiter ID and title are required" });
  }

  const job = await Job.create({
    recruiterId,
    title,
    description,
    skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : skillsRequired ? skillsRequired.split(",").map((item) => item.trim()) : [],
    salaryRange: salaryRange || {},
    location,
    employmentType,
    applicationDeadline,
    published: true,
    status: "open",
    active: true,
  });

  res.status(201).json({ message: "Job created", job });
};

exports.updateJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const updateFields = [
    "title",
    "description",
    "skillsRequired",
    "experienceLevel",
    "salaryRange",
    "location",
    "employmentType",
    "applicationDeadline",
    "published",
    "status",
    "active",
  ];

  updateFields.forEach((field) => {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  });

  if (req.body.skillsRequired && !Array.isArray(req.body.skillsRequired)) {
    job.skillsRequired = req.body.skillsRequired.split(",").map((item) => item.trim());
  }

  await job.save();
  res.json({ message: "Job updated", job });
};

exports.deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  job.active = false;
  job.status = "archived";
  await job.save();
  res.json({ message: "Job archived", job });
};

exports.updateJobStatus = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  const { status, published } = req.body;
  if (status) {
    job.status = status;
  }
  if (published !== undefined) {
    job.published = published;
  }
  await job.save();
  res.json({ message: "Job status updated", job });
};

exports.getJobApplications = async (req, res) => {
  const applications = await Application.find({ jobId: req.params.id }).populate("candidateId resumeId").sort({ appliedAt: -1 });
  res.json(applications);
};
