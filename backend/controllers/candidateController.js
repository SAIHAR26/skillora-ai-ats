const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
let pdfParse = null;
let mammoth = null;
try {
  pdfParse = require("pdf-parse");
} catch (_error) {
  pdfParse = null;
}
try {
  mammoth = require("mammoth");
} catch (_error) {
  mammoth = null;
}
const Candidate = require("../models/Candidate");
const Notification = require("../models/Notification");
const Resume = require("../models/Resume");
const Application = require("../models/Application");
const aiModelService = require("../services/aiModelService");
const { toClient } = require("../services/platformDataService");
const { getCandidateRecommendations, getCandidateSkillGap } = require("../services/candidateInsightService");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const candidateFilter = (id) => (mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id });
const candidateIdentityFilters = (candidate) => {
  const values = [candidate._id, String(candidate._id), candidate.id].filter(Boolean);
  return values.map((value) => ({ candidateId: value }));
};

function calculateProfileCompletion(candidate) {
  const fields = ["name", "email", "phone", "location", "college", "degree", "skills", "resumeUrl"];
  const completed = fields.reduce((count, field) => {
    const value = candidate[field];
    return count + ((Array.isArray(value) ? value.length > 0 : Boolean(value)) ? 1 : 0);
  }, 0);
  return Math.round((completed / fields.length) * 100);
}

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

const getCurrentCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOne({
    $or: [{ userId: req.user._id }, { userId: req.user.id }, { email: req.user.email }],
  }).populate("userId", "name email role status");

  if (!candidate) {
    return res.status(404).json({ message: "Candidate profile not found for the current user" });
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
    "avatar",
    "resumeUrl",
    "status",
  ];

  updateFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      candidate[field] = req.body[field];
    }
  });

  const beforeCompletion = calculateProfileCompletion(candidate);
  await candidate.save();
  const afterCompletion = calculateProfileCompletion(candidate);

  if (beforeCompletion < 100 && afterCompletion === 100) {
    await Notification.create({
      userId: candidate.userId || candidate._id,
      type: "profile_completed",
      title: "Profile completed",
      message: "Your candidate profile is now complete.",
      metadata: { candidateId: candidate._id },
    });
  }

  return res.json({ message: "Candidate profile updated", candidate: toClient(candidate) });
});

async function extractTextFromFile(file) {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const buffer = file.buffer;
  if (!buffer || !buffer.length) {
    return "";
  }
  if (extension === ".pdf" || file.mimetype === "application/pdf") {
    if (!pdfParse) {
      throw new Error("PDF resume parsing is unavailable until backend dependencies are installed.");
    }
    const parsed = await pdfParse(buffer);
    return parsed.text || "";
  }
  if (extension === ".docx" || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    if (!mammoth) {
      throw new Error("DOCX resume parsing is unavailable until backend dependencies are installed.");
    }
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value || "";
  }
  if (extension === ".txt" || file.mimetype === "text/plain") {
    return buffer.toString("utf8");
  }
  throw new Error("Unsupported resume format. Upload a .txt, .pdf, or .docx file.");
}

const addResume = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOne(candidateFilter(req.params.id));
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const isFileUpload = Boolean(req.file);
  const originalFileName = req.file?.originalname || req.body.originalFileName;
  const contentType = req.file?.mimetype || req.body.contentType;
  const fileSize = req.file?.size || Number(req.body.fileSize) || 0;
  let storageUrl = req.body.storageUrl || "";
  let extractedText = String(req.body.extractedText || "").trim();

  if (!originalFileName) {
    return res.status(400).json({ message: "Resume file name is required" });
  }

  if (isFileUpload) {
    extractedText = await extractTextFromFile(req.file);
    const uploadDir = path.resolve(__dirname, "..", "uploads", "resumes");
    await fs.mkdir(uploadDir, { recursive: true });
    const safeName = `${candidate._id || candidate.id}-${Date.now()}${path.extname(originalFileName)}`;
    const storagePath = path.join(uploadDir, safeName);
    await fs.writeFile(storagePath, req.file.buffer);
    storageUrl = `/uploads/resumes/${safeName}`;
  }

  let analysis = req.body.analysis || {};
  if (extractedText) {
    analysis = await aiModelService.scoreResume({ resumeText: extractedText });
  }

  const parsedSkills = Array.isArray(req.body.parsedSkills) && req.body.parsedSkills.length
    ? req.body.parsedSkills
    : analysis.skills || analysis.strengths || [];
  const atsScore = typeof req.body.atsScore === "number" ? req.body.atsScore : analysis.atsScore;
  const recommendations = Array.isArray(req.body.recommendations) && req.body.recommendations.length
    ? req.body.recommendations
    : analysis.suggestions || analysis.resumeImprovements || [];
  const processed = req.body.processed !== undefined ? req.body.processed : Boolean(analysis.atsScore);

  const previousAts = typeof candidate.atsScore === "number" ? candidate.atsScore : 0;

  const resume = await Resume.create({
    candidateId: candidate._id,
    originalFileName,
    storageUrl,
    contentType,
    fileSize,
    extractedText,
    parsedSkills,
    atsScore,
    analysis: analysis || {},
    recommendations: Array.isArray(recommendations) ? recommendations : [],
    extractedExperience: analysis.experience || {},
    extractedEducation: analysis.education || {},
    missingKeywords: analysis.missingKeywords || [],
    strengths: analysis.strengths || [],
    weaknesses: analysis.weaknesses || [],
    processed: processed || false,
  });

  candidate.resumeIds.push(resume._id);
  if (storageUrl) candidate.resumeUrl = storageUrl;
  if (typeof atsScore === "number") candidate.atsScore = atsScore;
  if (Array.isArray(parsedSkills) && parsedSkills.length) {
    candidate.skills = Array.from(new Set([...(candidate.skills || []), ...parsedSkills]));
  }
  await candidate.save();

  if (typeof atsScore === "number" && atsScore > previousAts) {
    await Notification.create({
      userId: candidate.userId || candidate._id,
      type: "ats_score_improved",
      title: "ATS score improved",
      message: `Your latest resume analysis improved your ATS score to ${atsScore}%.`,
      metadata: { resumeId: resume._id, atsScore, previousAts },
    });
  }

  const matchingJobs = await getCandidateRecommendations(candidate._id, 3);
  if (Array.isArray(matchingJobs.recommendations) && matchingJobs.recommendations.length > 0) {
    await Notification.create({
      userId: candidate.userId || candidate._id,
      type: "new_matching_job",
      title: "New matching jobs available",
      message: `We found ${matchingJobs.recommendations.length} new jobs matching your updated resume.`,
      metadata: { resumeId: resume._id, jobIds: matchingJobs.recommendations.map((job) => job.jobId) },
    });
  }

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

  const applications = await Application.find({ $or: candidateIdentityFilters(candidate) }).sort({ appliedAt: -1 });
  return res.json(applications);
});

const getCandidateSkillGapAnalysis = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOne(candidateFilter(req.params.id)).lean();
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const result = await getCandidateSkillGap(candidate._id, req.query.jobId);
  return res.json(result);
});

module.exports = {
  addResume,
  getCurrentCandidate,
  getCandidate,
  getCandidateApplications,
  getCandidateResumes,
  getCandidateSkillGapAnalysis,
  listCandidates,
  updateCandidate,
};
