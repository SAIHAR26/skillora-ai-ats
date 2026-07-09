const Interview = require("../models/Interview");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const Candidate = require("../models/Candidate");
const { getRecruiterForUser, idVariants, ownsMixedId } = require("../services/accessControl");
const mongoose = require("mongoose");
const idFilter = (id) => (id && mongoose.Types.ObjectId.isValid(String(id)) ? { _id: id } : { id });

async function assertRecruiterOwnsJob(req, job) {
  if (req.user?.role === "admin") return true;
  if (req.user?.role !== "recruiter") return false;
  const recruiter = await getRecruiterForUser(req.user);
  return recruiter && ownsMixedId([recruiter._id, recruiter.id], job.recruiterId);
}

function slotRange(scheduledAt, durationMinutes = 30) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + Number(durationMinutes || 30) * 60000);
  return { start, end };
}

exports.createInterview = async (req, res) => {
  const { applicationId, scheduledAt, durationMinutes, mode, location, meetingLink } = req.body;

  if (!applicationId || !scheduledAt) {
    return res.status(400).json({ message: "applicationId and scheduledAt are required" });
  }

  const application = await Application.findOne(idFilter(applicationId));
  if (!application) return res.status(404).json({ message: "Application not found" });
  const job = await Job.findOne(idFilter(application.jobId));
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (!(await assertRecruiterOwnsJob(req, job))) {
    return res.status(403).json({ message: "You cannot schedule interviews for another recruiter's job" });
  }

  const recruiter = req.user?.role === "recruiter" ? await getRecruiterForUser(req.user) : null;
  const { start, end } = slotRange(scheduledAt, durationMinutes);
  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    return res.status(400).json({ message: "Interview time must be a valid future date" });
  }

  const overlap = await Interview.findOne({
    recruiterId: { $in: idVariants(recruiter?._id || job.recruiterId).concat(idVariants(recruiter?.id)) },
    status: { $nin: ["cancelled", "completed"] },
    scheduledAt: { $lt: end },
    $expr: {
      $gt: [
        { $add: ["$scheduledAt", { $multiply: ["$durationMinutes", 60000] }] },
        start,
      ],
    },
  });
  if (overlap) {
    return res.status(409).json({ message: "Interview slot overlaps with an existing interview" });
  }

  const candidate = await Candidate.findOne(idFilter(application.candidateId));
  const interview = await Interview.create({
    applicationId,
    jobId: job._id,
    jobTitle: job.title,
    candidateId: application.candidateId,
    candidateName: application.candidateName,
    recruiterId: recruiter?._id || job.recruiterId,
    scheduledAt,
    date: start.toISOString().slice(0, 10),
    time: start.toISOString().slice(11, 16),
    durationMinutes: durationMinutes || 30,
    mode: mode || "online",
    location,
    meetingLink,
    status: "scheduled",
  });

  application.status = "interview_scheduled";
  await application.save();

  if (candidate?.userId) {
    await Notification.create({
      userId: candidate.userId,
      type: "interview_scheduled",
      title: "Interview scheduled",
      message: `Your interview for ${job.title} has been scheduled.`,
      metadata: { interviewId: interview._id, applicationId: application._id, jobId: job._id },
    });
  }

  res.status(201).json({ message: "Interview scheduled", interview });
};

exports.getInterviewById = async (req, res) => {
  const interview = await Interview.findOne(idFilter(req.params.id));
  if (!interview) {
    return res.status(404).json({ message: "Interview not found" });
  }
  res.json(interview);
};

exports.listInterviews = async (req, res) => {
  const { candidateId, recruiterId, jobId, status } = req.query;
  const filters = {};

  if (candidateId) filters.candidateId = candidateId;
  if (req.user?.role === "recruiter") {
    const recruiter = await getRecruiterForUser(req.user);
    if (!recruiter) return res.status(404).json({ message: "Recruiter profile not found" });
    filters.recruiterId = { $in: idVariants(recruiter._id).concat(idVariants(recruiter.id)) };
  } else if (recruiterId) {
    filters.recruiterId = { $in: idVariants(recruiterId) };
  }
  if (jobId) filters.jobId = jobId;
  if (status) filters.status = status;

  const interviews = await Interview.find(filters).sort({ scheduledAt: -1 });
  res.json(interviews);
};

exports.updateInterview = async (req, res) => {
  const interview = await Interview.findOne(idFilter(req.params.id));
  if (!interview) {
    return res.status(404).json({ message: "Interview not found" });
  }
  if (req.user?.role === "recruiter") {
    const recruiter = await getRecruiterForUser(req.user);
    if (!recruiter || !ownsMixedId([recruiter._id, recruiter.id], interview.recruiterId)) {
      return res.status(403).json({ message: "You cannot update another recruiter's interview" });
    }
  }

  if (req.body.scheduledAt) {
    const { start, end } = slotRange(req.body.scheduledAt, req.body.durationMinutes || interview.durationMinutes);
    if (Number.isNaN(start.getTime()) || start <= new Date()) {
      return res.status(400).json({ message: "Interview time must be a valid future date" });
    }
    const overlap = await Interview.findOne({
      _id: { $ne: interview._id },
      recruiterId: interview.recruiterId,
      status: { $nin: ["cancelled", "completed"] },
      scheduledAt: { $lt: end },
      $expr: {
        $gt: [
          { $add: ["$scheduledAt", { $multiply: ["$durationMinutes", 60000] }] },
          start,
        ],
      },
    });
    if (overlap) return res.status(409).json({ message: "Interview slot overlaps with an existing interview" });
    interview.date = start.toISOString().slice(0, 10);
    interview.time = start.toISOString().slice(11, 16);
  }

  const updateFields = ["scheduledAt", "durationMinutes", "mode", "location", "meetingLink", "feedback"];
  updateFields.forEach((field) => {
    if (req.body[field] !== undefined) interview[field] = req.body[field];
  });

  await interview.save();
  res.json({ message: "Interview updated", interview });
};

exports.updateInterviewStatus = async (req, res) => {
  const interview = await Interview.findOne(idFilter(req.params.id));
  if (!interview) {
    return res.status(404).json({ message: "Interview not found" });
  }
  if (req.user?.role === "recruiter") {
    const recruiter = await getRecruiterForUser(req.user);
    if (!recruiter || !ownsMixedId([recruiter._id, recruiter.id], interview.recruiterId)) {
      return res.status(403).json({ message: "You cannot update another recruiter's interview" });
    }
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  interview.status = status;
  await interview.save();
  res.json({ message: "Interview status updated", interview });
};
