const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const Recruiter = require("../models/Recruiter");
const { getCandidateForUser, getRecruiterForUser, idVariants, ownsMixedId } = require("../services/accessControl");
const mongoose = require("mongoose");

const idFilter = (id) => (id && mongoose.Types.ObjectId.isValid(String(id)) ? { _id: id } : { id });
const statusLabel = (value) => String(value || "applied").replace(/_/g, " ");
const openStatuses = ["open", "active"];

async function recruiterJobIds(user) {
  const recruiter = await getRecruiterForUser(user);
  if (!recruiter) return [];
  const jobs = await Job.find({ recruiterId: { $in: idVariants(recruiter._id).concat(idVariants(recruiter.id)) } }).select("_id id");
  return jobs.flatMap((job) => idVariants(job._id).concat(idVariants(job.id))).filter(Boolean);
}

async function canAccessApplication(req, application) {
  if (req.user?.role === "admin") return true;
  if (req.user?.role === "candidate") {
    const candidate = await getCandidateForUser(req.user);
    return candidate && ownsMixedId([candidate._id, candidate.id], application.candidateId);
  }
  if (req.user?.role === "recruiter") {
    const ids = await recruiterJobIds(req.user);
    return ownsMixedId(ids, application.jobId);
  }
  return false;
}

exports.createApplication = async (req, res) => {
  if (req.user?.role !== "candidate" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Only candidates can apply for jobs" });
  }

  const candidateProfile = req.user?.role === "candidate" ? await getCandidateForUser(req.user) : null;
  const { jobId, resumeId, score, remarks } = req.body;
  const candidateId = candidateProfile?._id || req.body.candidateId;

  if (!jobId || !candidateId) {
    return res.status(400).json({ message: "Job ID and candidate ID are required" });
  }

  const job = await Job.findOne(idFilter(jobId));
  if (!job || !openStatuses.includes(job.status) || !job.active || !job.published) {
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
    userId: candidate.userId || req.user?._id || candidate._id,
    type: "application_submitted",
    title: "Application submitted",
    message: `Your application for ${job.title} has been submitted.`,
    metadata: { applicationId: application._id, jobId: job._id },
  });

  const recruiter = await Recruiter.findOne({
    $or: [
      { _id: { $in: idVariants(job.recruiterId).filter((id) => String(id).match(/^[a-f\d]{24}$/i)) } },
      { id: String(job.recruiterId) },
    ],
  });
  if (recruiter?.userId) {
    await Notification.create({
      userId: recruiter.userId,
      type: "application_received",
      title: "New application received",
      message: `${candidate.name || "A candidate"} applied for ${job.title}.`,
      metadata: { applicationId: application._id, jobId: job._id, candidateId: candidate._id },
    });
  }

  res.status(201).json({ message: "Application created", application });
};

exports.getApplication = async (req, res) => {
  const application = await Application.findById(req.params.id).populate("jobId candidateId resumeId");
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }
  if (!(await canAccessApplication(req, application))) {
    return res.status(403).json({ message: "You cannot view this application" });
  }
  res.json(application);
};

exports.listApplications = async (req, res) => {
  const { candidateId, recruiterId, jobId, status, search, candidateName, skills, skill, experience, location } = req.query;
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
  if (req.user?.role === "candidate") {
    const candidate = await getCandidateForUser(req.user);
    if (!candidate) return res.status(404).json({ message: "Candidate profile not found" });
    filters.candidateId = { $in: idVariants(candidate._id).concat(idVariants(candidate.id)) };
  } else if (candidateId) {
    filters.candidateId = { $in: idVariants(candidateId) };
  }
  if (jobId) filters.jobId = { $in: idVariants(jobId) };
  if (status) filters.status = status;

  const candidateFilters = [];
  if (candidateName || search) {
    const regex = new RegExp(candidateName || search, "i");
    candidateFilters.push({ $or: [{ name: regex }, { email: regex }] });
    filters.$or = [...(filters.$or || []), { candidateName: regex }, { jobTitle: regex }, { company: regex }];
  }
  if (skills || skill) candidateFilters.push({ skills: { $in: [new RegExp(skills || skill, "i")] } });
  if (experience) {
    const regex = new RegExp(experience, "i");
    candidateFilters.push({ $or: [{ experienceLevel: regex }, { experienceYears: Number(experience) || -1 }] });
  }
  if (location) {
    const regex = new RegExp(location, "i");
    candidateFilters.push({ $or: [{ location: regex }, { currentLocation: regex }, { preferredLocation: regex }] });
  }
  if (candidateFilters.length) {
    const candidates = await Candidate.find({ $and: candidateFilters }).select("_id id");
    const ids = candidates.flatMap((candidate) => idVariants(candidate._id).concat(idVariants(candidate.id)));
    if (filters.candidateId?.$in) {
      const allowed = new Set(filters.candidateId.$in.map(String));
      filters.candidateId = { $in: ids.filter((id) => allowed.has(String(id))) };
    } else {
      filters.candidateId = { $in: ids };
    }
  }

  if (req.user?.role === "recruiter") {
    const ownedJobIds = await recruiterJobIds(req.user);
    if (filters.jobId?.$in) {
      const requested = new Set(filters.jobId.$in.map(String));
      filters.jobId = { $in: ownedJobIds.filter((id) => requested.has(String(id))) };
    } else {
      filters.jobId = { $in: ownedJobIds };
    }
  } else if (recruiterId) {
    const jobs = await Job.find({ recruiterId: { $in: idVariants(recruiterId) } }).select("_id id");
    const recruiterJobIds = jobs.flatMap((job) => idVariants(job._id).concat(idVariants(job.id)));
    if (filters.jobId?.$in) {
      const requested = new Set(filters.jobId.$in.map(String));
      filters.jobId = { $in: recruiterJobIds.filter((id) => requested.has(String(id))) };
    } else {
      filters.jobId = { $in: recruiterJobIds };
    }
  }

  const applications = await Application.find(filters).populate("jobId candidateId resumeId").sort({ appliedAt: -1 });
  res.json(applications);
};

exports.updateApplicationStatus = async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }
  if (req.user?.role !== "admin" && req.user?.role !== "recruiter") {
    return res.status(403).json({ message: "Only recruiters can update application status" });
  }
  if (!(await canAccessApplication(req, application))) {
    return res.status(403).json({ message: "You cannot update this application" });
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
  if (!(await canAccessApplication(req, application))) {
    return res.status(403).json({ message: "You cannot update this application" });
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
  if (!(await canAccessApplication(req, application))) {
    return res.status(403).json({ message: "You cannot delete this application" });
  }

  await application.deleteOne();
  res.json({ message: "Application deleted" });
};
