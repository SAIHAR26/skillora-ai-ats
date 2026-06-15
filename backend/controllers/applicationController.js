const Application = require("../models/Application");
const Job = require("../models/Job");

exports.createApplication = async (req, res) => {
  const { jobId, candidateId, resumeId, score, remarks } = req.body;

  if (!jobId || !candidateId) {
    return res.status(400).json({ message: "Job ID and candidate ID are required" });
  }

  const job = await Job.findById(jobId);
  if (!job || job.status !== "open" || !job.active) {
    return res.status(400).json({ message: "Job is not available for applications" });
  }

  const existing = await Application.findOne({ jobId, candidateId });
  if (existing) {
    return res.status(409).json({ message: "Candidate already applied for this job" });
  }

  const application = await Application.create({
    jobId,
    candidateId,
    resumeId,
    score: score || 0,
    remarks,
    status: "applied",
  });

  job.totalApplicants += 1;
  await job.save();

  res.status(201).json({ message: "Application created", application });
};

exports.getApplication = async (req, res) => {
  const application = await Application.findById(req.params.id).populate("jobId candidateId resumeId");
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }
  res.json(application);
};

exports.listApplications = async (req, res) => {
  const { candidateId, recruiterId, jobId, status } = req.query;
  const filters = {};

  if (candidateId) filters.candidateId = candidateId;
  if (jobId) filters.jobId = jobId;
  if (status) filters.status = status;

  if (recruiterId) {
    const jobs = await Job.find({ recruiterId }).select("_id");
    filters.jobId = { $in: jobs.map((job) => job._id) };
  }

  const applications = await Application.find(filters).populate("jobId candidateId resumeId").sort({ appliedAt: -1 });
  res.json(applications);
};

exports.updateApplicationStatus = async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  const { status } = req.body;
  if (status) application.status = status;
  application.updatedAt = new Date();
  await application.save();

  res.json({ message: "Application status updated", application });
};

exports.updateApplicationRemarks = async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  if (req.body.remarks !== undefined) application.remarks = req.body.remarks;
  application.updatedAt = new Date();
  await application.save();

  res.json({ message: "Application remarks updated", application });
};

exports.deleteApplication = async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  await application.deleteOne();
  res.json({ message: "Application deleted" });
};
