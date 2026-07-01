const aiModelService = require("../services/aiModelService");
const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const Resume = require("../models/Resume");
const { getRecruiterForUser, getCandidateForUser, idVariants } = require("../services/accessControl");
const mongoose = require("mongoose");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

function serializeSkills(value) {
  return Array.isArray(value) ? value.join(", ") : String(value || "");
}

function buildResumeText(candidate, resume, job) {
  return [
    resume?.extractedText,
    candidate?.summary,
    candidate?.headline,
    `Skills: ${serializeSkills(candidate?.skills)} ${serializeSkills(resume?.parsedSkills)}`,
    `Experience: ${candidate?.experienceYears || 0} years ${candidate?.experienceLevel || ""}`,
    `Education: ${candidate?.degree || ""} ${candidate?.specialization || ""}`,
    `Target job: ${job?.title || ""} ${job?.description || ""} ${serializeSkills(job?.skillsRequired || job?.skills)}`,
  ].filter(Boolean).join("\n");
}

async function scoreApplication(application) {
  const [candidate, job, resume] = await Promise.all([
    Candidate.findById(application.candidateId).lean(),
    Job.findById(application.jobId).lean(),
    application.resumeId ? Resume.findById(application.resumeId).lean() : null,
  ]);

  const resumeText = buildResumeText(candidate, resume, job);
  const modelResult = await aiModelService.scoreResume({
    resumeText,
    yearsExperience: candidate?.experienceYears || 0,
    educationLevel: candidate?.degree || candidate?.education?.[0],
    skillsMatchScore: application.atsScore || undefined,
    projectCount: Array.isArray(candidate?.projects) ? candidate.projects.length : 0,
    resumeLength: resumeText.split(/\s+/).filter(Boolean).length,
  });

  const atsScore = Number(modelResult.atsScore || 0);
  await Application.updateOne(
    { _id: application._id },
    {
      $set: {
        atsScore,
        score: atsScore,
        aiResultId: null,
        updatedAt: new Date(),
      },
    },
  );

  return {
    id: String(application._id),
    applicationId: String(application._id),
    candidateId: candidate ? String(candidate._id) : String(application.candidateId),
    candidateName: candidate?.name || application.candidateName,
    jobId: job ? String(job._id) : String(application.jobId),
    jobTitle: job?.title || application.jobTitle,
    company: job?.company || application.company,
    atsScore,
    matchScore: atsScore,
    status: application.status,
    skills: candidate?.skills || resume?.parsedSkills || [],
    experience: candidate?.experienceYears ?? candidate?.experienceLevel,
    education: candidate?.degree || candidate?.education?.[0],
    location: candidate?.location || candidate?.currentLocation,
    breakdown: modelResult.breakdown,
    recommendation: modelResult.recommendation,
    reasons: [
      `ATS model score: ${atsScore}`,
      `Skills considered: ${serializeSkills(candidate?.skills || resume?.parsedSkills) || "not provided"}`,
      `Experience considered: ${candidate?.experienceYears || 0} years`,
    ],
  };
}

const getRankings = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 25;
  const filters = {};

  if (req.query.jobId) filters.jobId = { $in: idVariants(req.query.jobId) };

  if (req.user?.role === "recruiter") {
    const recruiter = await getRecruiterForUser(req.user);
    if (!recruiter) return res.status(404).json({ message: "Recruiter profile not found" });
    const jobs = await Job.find({ recruiterId: { $in: idVariants(recruiter._id).concat(idVariants(recruiter.id)) } }).select("_id id");
    filters.jobId = { $in: jobs.flatMap((job) => idVariants(job._id).concat(idVariants(job.id))) };
  } else if (req.query.recruiterId) {
    const jobs = await Job.find({ recruiterId: { $in: idVariants(req.query.recruiterId) } }).select("_id id");
    filters.jobId = { $in: jobs.flatMap((job) => idVariants(job._id).concat(idVariants(job.id))) };
  }

  const applications = await Application.find(filters).sort({ appliedAt: -1 }).limit(Math.max(limit, 1));
  const rankings = await Promise.all(applications.map(scoreApplication));
  res.json({
    rankings: rankings.sort((a, b) => b.atsScore - a.atsScore).slice(0, limit),
    source: "mongodb",
    model: "ats_model",
  });
});

const rankCandidates = asyncHandler(async (req, res) => {
  if (req.body?.applicationIds || req.body?.jobId || req.body?.recruiterId) {
    req.query = { ...req.query, jobId: req.body.jobId, recruiterId: req.body.recruiterId, limit: req.body.limit };
    return getRankings(req, res);
  }
  const result = await aiModelService.rankCandidates(req.body);
  res.json(result);
});

const scoreResume = asyncHandler(async (req, res) => {
  const result = await aiModelService.scoreResume(req.body);
  res.json(result);
});

const classifyResume = asyncHandler(async (req, res) => {
  const result = await aiModelService.classifyResume(req.body);
  res.json(result);
});

function scoreJobForCandidate(candidate, job) {
  const candidateSkills = new Set((candidate?.skills || []).map((skill) => String(skill).toLowerCase()));
  const required = (job.skillsRequired?.length ? job.skillsRequired : job.skills || []).map((skill) => String(skill).toLowerCase());
  const matched = required.filter((skill) => candidateSkills.has(skill));
  const skillScore = required.length ? (matched.length / required.length) * 70 : 20;
  const locationText = `${candidate?.preferredLocation || ""} ${(candidate?.preferredLocations || []).join(" ")} ${candidate?.location || ""}`.toLowerCase();
  const locationScore = job.location && locationText.includes(String(job.location).toLowerCase()) ? 15 : 0;
  const typeScore = (candidate?.preferredJobTypes || []).some((type) => [job.employmentType, job.type].map(String).join(" ").toLowerCase().includes(String(type).toLowerCase())) ? 15 : 0;
  return {
    score: Math.round(Math.max(0, Math.min(100, skillScore + locationScore + typeScore))),
    matched,
    missing: required.filter((skill) => !candidateSkills.has(skill)),
  };
}

async function resolveCandidateId(req) {
  if (req.body?.candidateId || req.body?.cvId || req.query?.candidateId) {
    return req.body?.candidateId || req.body?.cvId || req.query?.candidateId;
  }
  if (req.user?.role === "candidate") {
    const candidate = await getCandidateForUser(req.user);
    return candidate ? (candidate._id || candidate.id) : undefined;
  }
  return undefined;
}

const recommendJobs = asyncHandler(async (req, res) => {
  const candidateId = await resolveCandidateId(req);
  if (candidateId && candidateId !== "0") {
    const result = await getCandidateRecommendations(candidateId, req.body.limit);
    res.json({
      ...result,
      candidate: {
        ...result.candidate,
        cvId: result.candidate.id,
      },
    });
    return;
  }

  const result = await aiModelService.recommendJobs(req.body);
  res.json(result);
});

const predictSelection = asyncHandler(async (req, res) => {
  const result = await aiModelService.predictSelection(req.body);
  res.json(result);
});

const skillGap = asyncHandler(async (req, res) => {
  const candidateId = await resolveCandidateId(req);
  if (candidateId && candidateId !== "0") {
    const result = await getCandidateSkillGap(candidateId, req.body.jobId);
    res.json(result);
    return;
  }

  const result = await aiModelService.skillGap(req.body);
  res.json(result);
});

const getModelStatus = asyncHandler(async (_req, res) => {
  const result = await aiModelService.getModelStatus();
  res.json(result);
});

const getTraining = asyncHandler(async (_req, res) => {
  const status = await aiModelService.getModelStatus();
  const ats = status.report?.models?.ats_model;
  const bestMetrics = ats?.candidates?.[ats.best_model];
  res.json({
    rows: ats?.rows || 0,
    shortlistedRate: bestMetrics ? Math.round(bestMetrics.recall * 100) : 0,
    averageSkillsMatch: bestMetrics ? Math.round(bestMetrics.precision * 100) : 0,
    averageExperienceYears: null,
    weights: {
      skillsMatch: 40,
      experience: 25,
      education: 20,
      resumeQuality: 15,
    },
    bestModel: ats?.best_model || "unknown",
    accuracy: bestMetrics?.accuracy || null,
    f1: bestMetrics?.f1 || null,
  });
});

module.exports = {
  classifyResume,
  getModelStatus,
  getRankings,
  getTraining,
  predictSelection,
  rankCandidates,
  recommendJobs,
  scoreResume,
  skillGap,
};
