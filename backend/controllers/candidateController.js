const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");
const Resume = require("../models/Resume");
const Application = require("../models/Application");
const { toClient } = require("../services/platformDataService");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const candidateFilter = (id) => (mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id });

const listCandidates = asyncHandler(async (req, res) => {
  const query = req.query.search ? { $text: { $search: req.query.search } } : {};
  const candidates = await Candidate.find(query).limit(100).lean();
  return res.json({ candidates: candidates.map(toClient) });
});

const getCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOne(candidateFilter(req.params.id)).populate("userId", "name email role status");
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }
  return res.json(candidate);
});

const updateCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOne(candidateFilter(req.params.id));
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const updateFields = [
    "name",
    "email",
    "phone",
    "phoneNumber",
    "headline",
    "summary",
    "college",
    "degree",
    "specialization",
    "graduationYear",
    "cgpa",
    "currentLocation",
    "location",
    "preferredLocation",
    "experienceLevel",
    "experienceYears",
    "skills",
    "education",
    "workExperience",
    "projects",
    "certifications",
    "preferredJobTypes",
    "preferredLocations",
    "workPreference",
    "linkedin",
    "github",
    "resumeUrl",
    "status",
  ];

  updateFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      candidate[field] = req.body[field];
    }
  });

  await candidate.save();
  return res.json({ message: "Candidate profile updated", candidate: toClient(candidate) });
});

const addResume = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOne(candidateFilter(req.params.id));
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const { originalFileName, storageUrl, contentType, fileSize, extractedText, parsedSkills, processed } = req.body;
  if (!originalFileName || !storageUrl) {
    return res.status(400).json({ message: "Resume file metadata is required" });
  }

  const resume = await Resume.create({
    candidateId: candidate._id,
    originalFileName,
    storageUrl,
    contentType,
    fileSize,
    extractedText,
    parsedSkills,
    processed: processed || false,
  });

  candidate.resumeIds.push(resume._id);
  candidate.resumeUrl = storageUrl;
  await candidate.save();

  return res.status(201).json({ message: "Resume metadata saved", resume });
});

const getCandidateResumes = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOne(candidateFilter(req.params.id));
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const resumes = await Resume.find({ candidateId: candidate._id }).sort({ createdAt: -1 });
  return res.json(resumes);
});

const getCandidateApplications = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOne(candidateFilter(req.params.id));
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const applications = await Application.find({
    $or: [{ candidateId: candidate._id }, { candidateId: candidate.id }],
  }).populate("jobId resumeId").sort({ appliedAt: -1 });
  return res.json(applications);
});

module.exports = {
  addResume,
  getCandidate,
  getCandidateApplications,
  getCandidateResumes,
  listCandidates,
  updateCandidate,
};
