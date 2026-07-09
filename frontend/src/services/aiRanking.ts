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
  breakdown: {
    skillsMatch: number;
    experienceYears: number;
    projects: number;
    resumeLength: number;
    educationLevel: string;
  };
  strengths: string[];
  suggestions: string[];
}

export interface JobRecommendation {
  jobId: string;
  title: string;
  company: string;
  matchScore: number;
  industry: string;
  location: string;
  reason: string;
}

export interface SkillGapResult {
  targetJob: JobRecommendation | null;
  matched: { skill: string; level: number }[];
  missing: { skill: string; recommended: string }[];
  learningPath: { step: number; title: string; duration: string; type: string }[];
}

export interface ModelStatus {
  status: string;
  artifacts: string[];
  report: Record<string, unknown>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("skillora_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let details: { message?: string } = {};
    try {
      details = await response.json();
    } catch {
      details = {};
    }
    throw new Error(details.message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchAiRankings(limit = 25) {
  return requestJson<{ rankings: AiRanking[]; model?: string }>(`/ai/rankings?limit=${limit}`);
}

export async function fetchAiTrainingSummary() {
  return requestJson<AiTrainingSummary>("/ai/training-summary");
}

export async function fetchModelStatus() {
  return requestJson<ModelStatus>("/ai/model-status");
}

export async function scoreResume(resumeText: string) {
  return requestJson<ResumeScoreResult>("/ai/score-resume", {
    method: "POST",
    body: JSON.stringify({ resumeText }),
  });
}

export async function recommendJobs(cvId = "0", limit = 5) {
  return requestJson<{ candidate: { cvId: string; name: string; desiredJob: string }; recommendations: JobRecommendation[] }>("/ai/recommend-jobs", {
    method: "POST",
    body: JSON.stringify({ candidateId: cvId, cvId, limit }),
  });
}

export async function fetchSkillGap(cvId = "0") {
  return requestJson<SkillGapResult>("/ai/skill-gap", {
    method: "POST",
    body: JSON.stringify({ candidateId: cvId, cvId }),
  });
}
