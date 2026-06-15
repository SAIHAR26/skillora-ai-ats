const Candidate = require("../models/Candidate");
const Resume = require("../models/Resume");
const Application = require("../models/Application");

exports.getCandidate = async (req, res) => {
  const candidate = await Candidate.findById(req.params.id).populate("userId", "name email role status");
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }
  res.json(candidate);
};

exports.updateCandidate = async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const updateFields = [
    "headline",
    "summary",
    "location",
    "experienceYears",
    "skills",
    "education",
    "workExperience",
    "projects",
    "certifications",
    "preferredJobTypes",
    "preferredLocations",
  ];

  updateFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      candidate[field] = req.body[field];
    }
  });

  await candidate.save();
  res.json({ message: "Candidate profile updated", candidate });
};

exports.addResume = async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
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
  await candidate.save();

  res.status(201).json({ message: "Resume metadata saved", resume });
};

exports.getCandidateResumes = async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const resumes = await Resume.find({ candidateId: candidate._id }).sort({ createdAt: -1 });
  res.json(resumes);
};

exports.getCandidateApplications = async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const applications = await Application.find({ candidateId: candidate._id }).populate("jobId resumeId").sort({ appliedAt: -1 });
  res.json(applications);
};
