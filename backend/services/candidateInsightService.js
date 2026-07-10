const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const Resume = require("../models/Resume");
const aiModelService = require("./aiModelService");
const mongoose = require("mongoose");

const normalize = (value) => String(value || "").trim().toLowerCase();
const normalizeList = (items) => [...new Set((Array.isArray(items) ? items : [])
  .map((item) => String(item || "").trim())
  .filter(Boolean))];

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));
const isObjectId = (id) => id && mongoose.Types.ObjectId.isValid(String(id));
const candidateIdFilter = (id) => (isObjectId(id) ? { _id: toObjectId(id) } : { id });

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

function buildCandidateResumeText(candidate, latestResume, job) {
  const education = Array.isArray(candidate.education)
    ? candidate.education.map((item) => typeof item === "string" ? item : [item.degree, item.field, item.institution, item.college].filter(Boolean).join(" ")).join("\n")
    : "";
  const projects = Array.isArray(candidate.projects)
    ? candidate.projects.map((item) => typeof item === "string" ? item : [item.name, item.description].filter(Boolean).join(" ")).join("\n")
    : "";
  return [
    latestResume?.extractedText,
    candidate.summary,
    candidate.headline,
    `Skills: ${candidateSkillProfile(candidate, latestResume).join(", ")}`,
    `Experience: ${candidate.experienceYears || 0} years ${candidate.experienceLevel || ""}`,
    `Education: ${candidate.degree || ""} ${candidate.specialization || ""} ${education}`,
    `Projects: ${projects}`,
    `Target job: ${job.title || ""} ${job.description || ""} ${jobSkills(job).join(", ")}`,
  ].filter(Boolean).join("\n");
}

function profileMatch(candidate, job, latestResume) {
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

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    locationScore,
    typeScore,
    experienceScore,
  };
}

async function matchJob(candidate, job, latestResume) {
  const profile = profileMatch(candidate, job, latestResume);
  const requiredSkills = jobSkills(job);
  const resumeText = buildCandidateResumeText(candidate, latestResume, job);
  const modelResult = await aiModelService.scoreResume({
    resumeText,
    yearsExperience: candidate.experienceYears || 0,
    educationLevel: candidate.degree || candidate.education?.[0],
    skillsMatchScore: profile.matchScore,
    projectCount: Array.isArray(candidate.projects) ? candidate.projects.length : 0,
    resumeLength: resumeText.split(/\s+/).filter(Boolean).length,
    targetKeywords: requiredSkills,
  });
  const modelScore = Number(modelResult.atsScore || 0);
  const matchScore = Math.max(0, Math.min(100, Math.round((modelScore * 0.65) + (profile.matchScore * 0.35))));

  const reasons = [];
  if (profile.matchedSkills.length) reasons.push(`Matched skills: ${profile.matchedSkills.slice(0, 5).join(", ")}`);
  if (profile.locationScore) reasons.push(`Location aligns with ${job.location}`);
  if (profile.typeScore) reasons.push(`Work type matches ${job.employmentType || job.type}`);
  if (profile.experienceScore) reasons.push(`Experience level matches ${job.experienceLevel}`);
  if (modelResult.recommendation) reasons.push(`ATS model recommendation: ${modelResult.recommendation}`);
  if (!reasons.length) reasons.push("Ranked from your resume, profile, and MongoDB job requirements.");

  return {
    jobId: String(job._id),
    id: String(job._id),
    title: job.title,
    company: job.company || "Company not listed",
    matchScore,
    modelScore,
    profileScore: profile.matchScore,
    source: "mongodb",
    model: "ats_model",
    industry: job.industry || "",
    location: job.location || "Location not listed",
    employmentType: job.employmentType || job.type || "",
    reason: reasons.join(" | "),
    matchedSkills: profile.matchedSkills,
    missingSkills: profile.missingSkills,
    matchedKeywords: modelResult.matchedKeywords || [],
    missingKeywords: modelResult.missingKeywords || profile.missingSkills,
    resumeImprovements: modelResult.resumeImprovements || latestResume?.recommendations || latestResume?.analysis?.resumeImprovements || [],
    interviewPreparationTips: modelResult.interviewPreparationTips || latestResume?.analysis?.interviewPreparationTips || [],
    suggestedCertifications: modelResult.suggestedCertifications || latestResume?.analysis?.suggestedCertifications || [],
    careerRecommendations: modelResult.careerRecommendations || latestResume?.analysis?.careerRecommendations || [],
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

  const preselectedJobs = jobs
    .map((job) => ({ job, score: profileMatch(candidate, job, latestResume).matchScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(5, Math.min((Number(limit) || 10) * 3, 30)))
    .map((item) => item.job);

  const scoredRecommendations = [];
  for (const job of preselectedJobs) {
    scoredRecommendations.push(await matchJob(candidate, job, latestResume));
  }

  const recommendations = scoredRecommendations
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
    source: "mongodb",
    model: "ats_model",
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


