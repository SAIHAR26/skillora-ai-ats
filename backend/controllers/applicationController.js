const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const Notification = require("../models/Notification");

const idFilter = (id) => (id && id.match && id.match(/^[a-f\d]{24}$/i) ? { _id: id } : { id });
const statusLabel = (value) => String(value || "applied").replace(/_/g, " ");

exports.createApplication = async (req, res) => {
  const { jobId, candidateId, resumeId, score, remarks } = req.body;

  if (!jobId || !candidateId) {
    return res.status(400).json({ message: "Job ID and candidate ID are required" });
  }

  const job = await Job.findOne(idFilter(jobId));
  if (!job || job.status !== "open" || !job.active) {
    return res.status(400).json({ message: "Job is not available for applications" });
  }

  const candidate = await Candidate.findOne(idFilter(candidateId));
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const existing = await Application.findOne({
    $or: [
      { jobId: job._id, candidateId: candidate._id },
      { jobId: job.id, candidateId: candidate.id },
      { jobId, candidateId },
    ],
  });
  if (existing) {
    return res.status(409).json({ message: "Candidate already applied for this job" });
  }

  const application = await Application.create({
    jobId: job._id,
    candidateId: candidate._id,
    candidateName: candidate.name,
    jobTitle: job.title,
    company: job.company,
    resumeId,
    atsScore: score || candidate.atsScore || 0,
    score: score || candidate.atsScore || 0,
    remarks,
    status: "applied",
    appliedDate: new Date().toISOString().slice(0, 10),
  });

  job.totalApplicants += 1;
  job.applications = (job.applications || 0) + 1;
  await job.save();

  await Notification.create({
    userId: candidate.userId || candidate._id,
    type: "application_received",
    title: "Application submitted",
    message: `Your application for ${job.title} has been submitted.`,
    metadata: { applicationId: application._id, jobId: job._id },
  });

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

  if (candidateId) {
    const candidate = await Candidate.findOne(idFilter(candidateId)).select("_id id");
    if (!candidate) {
      return res.json([]);
    }
    const ids = [candidate._id, String(candidate._id), candidate.id].filter(Boolean);
    filters.$or = ids.map((id) => ({ candidateId: id }));
  }
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

  const candidate = await Candidate.findById(application.candidateId);
  if (candidate && status) {
    const typeByStatus = {
      shortlisted: "application_shortlisted",
      rejected: "application_rejected",
      selected: "application_accepted",
      interview: "interview_scheduled",
      interview_scheduled: "interview_scheduled",
    };
    await Notification.create({
      userId: candidate.userId || candidate._id,
      type: typeByStatus[status] || "status_update",
      title: "Application status updated",
      message: `Your application status is now ${statusLabel(status)}.`,
      metadata: { applicationId: application._id, status },
    });
  }

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
