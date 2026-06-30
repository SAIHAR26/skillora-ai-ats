const aiModelService = require("../services/aiModelService");
const {
  getCandidateRecommendations,
  getCandidateSkillGap,
} = require("../services/candidateInsightService");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

const getRankings = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 25;
  const result = await aiModelService.rankCandidates({ ...req.body, limit });
  res.json(result);
});

const rankCandidates = asyncHandler(async (req, res) => {
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

const recommendJobs = asyncHandler(async (req, res) => {
  const candidateId = req.body.candidateId || req.body.cvId;
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
  const candidateId = req.body.candidateId || req.body.cvId;
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
