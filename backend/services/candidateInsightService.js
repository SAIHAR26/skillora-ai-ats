const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const Resume = require("../models/Resume");

const normalize = (value) => String(value || "").trim().toLowerCase();
const normalizeList = (items) => [...new Set((Array.isArray(items) ? items : [])
  .map((item) => String(item || "").trim())
  .filter(Boolean))];

const candidateIdFilter = (id) => (id && /^[a-f\d]{24}$/i.test(String(id)) ? { _id: id } : { id });

function jobSkills(job) {
  return normalizeList([...(job.skillsRequired || []), ...(job.skills || [])]);
}

function candidateSkillProfile(candidate, latestResume) {
  return normalizeList([
    ...(candidate.skills || []),
    ...(latestResume?.parsedSkills || []),
    ...(latestResume?.analysis?.skills || []),
  ]);
}

function matchJob(candidate, job, latestResume) {
  const candidateSkills = candidateSkillProfile(candidate, latestResume);
  const requiredSkills = jobSkills(job);
  const candidateSkillSet = new Set(candidateSkills.map(normalize));
  const matchedSkills = requiredSkills.filter((skill) => candidateSkillSet.has(normalize(skill)));
  const missingSkills = requiredSkills.filter((skill) => !candidateSkillSet.has(normalize(skill)));

  const skillScore = requiredSkills.length ? (matchedSkills.length / requiredSkills.length) * 55 : 10;
  const locationText = normalize(`${candidate.location || ""} ${candidate.currentLocation || ""} ${(candidate.preferredLocations || []).join(" ")} ${candidate.preferredLocation || ""}`);
  const locationScore = job.location && locationText.includes(normalize(job.location)) ? 12 : 0;
  const typeText = normalize(`${(candidate.preferredJobTypes || []).join(" ")} ${candidate.workPreference || ""}`);
  const typeScore = (job.employmentType || job.type) && typeText.includes(normalize(job.employmentType || job.type)) ? 8 : 0;
  const experienceText = normalize(`${candidate.experienceLevel || ""} ${candidate.experienceYears || ""}`);
  const experienceScore = job.experienceLevel && experienceText.includes(normalize(job.experienceLevel)) ? 10 : 0;
  const atsScore = Math.min(15, Math.max(0, Number(candidate.atsScore || 0) * 0.15));
  const matchScore = Math.max(0, Math.min(100, Math.round(skillScore + locationScore + typeScore + experienceScore + atsScore)));

  const reasons = [];
  if (matchedSkills.length) reasons.push(`Matched skills: ${matchedSkills.slice(0, 5).join(", ")}`);
  if (locationScore) reasons.push(`Location aligns with ${job.location}`);
  if (typeScore) reasons.push(`Work type matches ${job.employmentType || job.type}`);
  if (experienceScore) reasons.push(`Experience level matches ${job.experienceLevel}`);
  if (!reasons.length) reasons.push("Ranked from your saved profile and available MongoDB job fields.");

  return {
    jobId: String(job._id),
    title: job.title,
    company: job.company || "Company not listed",
    matchScore,
    industry: job.industry || "",
    location: job.location || "Location not listed",
    employmentType: job.employmentType || job.type || "",
    reason: reasons.join(" | "),
    matchedSkills,
    missingSkills,
    resumeImprovements: latestResume?.recommendations || latestResume?.analysis?.resumeImprovements || [],
    interviewPreparationTips: latestResume?.analysis?.interviewPreparationTips || [],
    suggestedCertifications: latestResume?.analysis?.suggestedCertifications || [],
    careerRecommendations: latestResume?.analysis?.careerRecommendations || [],
  };
}

async function getCandidateRecommendations(candidateId, limit = 10) {
  const candidate = await Candidate.findOne(candidateIdFilter(candidateId)).lean();
  if (!candidate) {
    const error = new Error("Candidate not found");
    error.statusCode = 404;
    throw error;
  }
  const latestResume = await Resume.findOne({ candidateId: candidate._id }).sort({ createdAt: -1 }).lean();

  const jobs = await Job.find({
    active: true,
    published: true,
    status: { $in: ["open", "active"] },
  }).lean();

  const recommendations = jobs
    .map((job) => matchJob(candidate, job, latestResume))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, Math.max(1, Math.min(Number(limit) || 10, 50)));

  return {
    candidate: {
      id: String(candidate._id),
      name: candidate.name || "",
      desiredJob: candidate.headline || candidate.experienceLevel || "",
      latestAtsScore: latestResume?.atsScore || candidate.atsScore || 0,
    },
    recommendations,
  };
}

async function getCandidateSkillGap(candidateId, jobId) {
  const { recommendations } = await getCandidateRecommendations(candidateId, 25);
  const target = jobId
    ? recommendations.find((item) => item.jobId === String(jobId))
    : recommendations[0];

  if (!target) {
    return {
      targetJob: null,
      matched: [],
      missing: [],
      matchPercentage: 0,
      learningPath: [],
    };
  }

  return {
    targetJob: target,
    matched: target.matchedSkills.map((skill) => ({ skill, level: 100 })),
    missing: target.missingSkills.map((skill) => ({
      skill,
      recommended: `Build a portfolio task or course module covering ${skill}.`,
    })),
    matchPercentage: target.matchScore,
    learningPath: target.missingSkills.slice(0, 5).map((skill, index) => ({
      step: index + 1,
      title: `Improve ${skill}`,
      duration: "1-2 weeks",
      type: "practice",
    })),
    resumeImprovements: target.resumeImprovements,
    interviewPreparationTips: target.interviewPreparationTips,
    suggestedCertifications: target.suggestedCertifications,
    careerRecommendations: target.careerRecommendations,
  };
}

module.exports = {
  getCandidateRecommendations,
  getCandidateSkillGap,
};
