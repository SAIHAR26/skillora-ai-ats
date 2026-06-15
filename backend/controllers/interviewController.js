const Interview = require("../models/Interview");

exports.createInterview = async (req, res) => {
  const { applicationId, jobId, candidateId, recruiterId, scheduledAt, durationMinutes, mode, location } = req.body;

  if (!applicationId || !jobId || !candidateId || !recruiterId || !scheduledAt) {
    return res.status(400).json({ message: "applicationId, jobId, candidateId, recruiterId and scheduledAt are required" });
  }

  const interview = await Interview.create({
    applicationId,
    jobId,
    candidateId,
    recruiterId,
    scheduledAt,
    durationMinutes: durationMinutes || 30,
    mode: mode || "online",
    location,
    status: "scheduled",
  });

  res.status(201).json({ message: "Interview scheduled", interview });
};

exports.getInterviewById = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    return res.status(404).json({ message: "Interview not found" });
  }
  res.json(interview);
};

exports.listInterviews = async (req, res) => {
  const { candidateId, recruiterId, jobId, status } = req.query;
  const filters = {};

  if (candidateId) filters.candidateId = candidateId;
  if (recruiterId) filters.recruiterId = recruiterId;
  if (jobId) filters.jobId = jobId;
  if (status) filters.status = status;

  const interviews = await Interview.find(filters).sort({ scheduledAt: -1 });
  res.json(interviews);
};

exports.updateInterview = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    return res.status(404).json({ message: "Interview not found" });
  }

  const updateFields = ["scheduledAt", "durationMinutes", "mode", "location", "feedback"];
  updateFields.forEach((field) => {
    if (req.body[field] !== undefined) interview[field] = req.body[field];
  });

  await interview.save();
  res.json({ message: "Interview updated", interview });
};

exports.updateInterviewStatus = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    return res.status(404).json({ message: "Interview not found" });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  interview.status = status;
  await interview.save();
  res.json({ message: "Interview status updated", interview });
};
