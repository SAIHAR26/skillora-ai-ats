export interface AiRanking {
  id: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  atsScore: number;
  matchScore?: number;
  status: string;
  skills: string[];
  experience: string;
  education: string;
  location: string;
  reasons: string[];
}

export interface AiTrainingSummary {
  rows: number;
  shortlistedRate: number;
  averageSkillsMatch: number;
  averageExperienceYears: number | null;
  bestModel?: string;
  accuracy?: number | null;
  f1?: number | null;
  weights: {
    skillsMatch: number;
    experience: number;
    education: number;
    resumeQuality: number;
  };
}

export interface ResumeScoreResult {
  atsScore: number;
  selectionProbability: number;
  recommendation: string;
  classification: string | null;
  skills?: string[];
  matchedKeywords?: string[];
  missingKeywords?: string[];
  sectionDetection?: Record<string, boolean>;
  atsBreakdown?: Record<string, number | null>;
  experience?: { years?: number; projectSignals?: number };
  education?: { level?: string; degrees?: string[] };
  breakdown: {
    skillsMatch: number;
    experienceYears: number;
    projects: number;
    resumeLength: number;
    educationLevel: string;
  };
  strengths: string[];
  weaknesses?: string[];
  suggestions: string[];
  resumeImprovements?: string[];
  interviewPreparationTips?: string[];
  suggestedCertifications?: string[];
  careerRecommendations?: string[];
}

export interface JobRecommendation {
  jobId: string;
  id?: string;
  title: string;
  company: string;
  matchScore: number;
  modelScore?: number;
  profileScore?: number;
  source?: string;
  model?: string;
  industry: string;
  location: string;
  reason: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  matchedKeywords?: string[];
  missingKeywords?: string[];
  resumeImprovements?: string[];
  interviewPreparationTips?: string[];
  suggestedCertifications?: string[];
  careerRecommendations?: string[];
}

export interface SkillGapResult {
  targetJob: JobRecommendation;
  matched: { skill: string; level: number }[];
  missing: { skill: string; recommended: string }[];
  learningPath: { step: number; title: string; duration: string; type: string }[];
  resumeImprovements?: string[];
  interviewPreparationTips?: string[];
  suggestedCertifications?: string[];
  careerRecommendations?: string[];
}

export interface ModelStatus {
  status: string;
  artifacts: string[];
  report: Record<string, unknown>;
}

import { apiRequest } from "./platformApi";

export async function fetchAiRankings(limit = 25) {
  return apiRequest<{ rankings: AiRanking[]; model?: string }>(`/ai/rankings?limit=${limit}`);
}

export async function fetchAiTrainingSummary() {
  return apiRequest<AiTrainingSummary>("/ai/training-summary");
}

export async function fetchModelStatus() {
  return apiRequest<ModelStatus>("/ai/model-status");
}

export async function scoreResume(resumeText: string) {
  return apiRequest<ResumeScoreResult>("/ai/score-resume", {
    method: "POST",
    body: JSON.stringify({ resumeText }),
  });
}

export async function recommendJobs(candidateId = "0", limit = 5) {
  return apiRequest<{ candidate: { cvId: string; name: string; desiredJob: string }; recommendations: JobRecommendation[] }>("/ai/recommend-jobs", {
    method: "POST",
    body: JSON.stringify({ candidateId, limit }),
  });
}

export async function fetchSkillGap(candidateId = "0") {
  return apiRequest<SkillGapResult>("/ai/skill-gap", {
    method: "POST",
    body: JSON.stringify({ candidateId }),
  });
}
