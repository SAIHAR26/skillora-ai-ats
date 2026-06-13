const fs = require("fs");
const path = require("path");
const readline = require("readline");

const dataRoot = path.resolve(__dirname, "..", "..");

const files = {
  training: path.join(dataRoot, "ai_resume_screening.csv"),
  applications: path.join(dataRoot, "applications.csv"),
  cvs: path.join(dataRoot, "cv_data.csv"),
  jobs: path.join(dataRoot, "job_data.csv"),
};

let trainingCache;
let applicationsCache;

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function toRecord(headers, line) {
  const values = parseCsvLine(line);
  return headers.reduce((record, header, index) => {
    record[header] = values[index] || "";
    return record;
  }, {});
}

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required dataset is missing: ${path.basename(filePath)}`);
  }
}

async function readCsvSample(filePath, limit = 1000) {
  ensureFile(filePath);

  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers;
  const rows = [];

  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }

    if (!line.trim()) continue;
    rows.push(toRecord(headers, line));
    if (rows.length >= limit) {
      rl.close();
      stream.destroy();
      break;
    }
  }

  return rows;
}

async function findRowsById(filePath, idColumn, ids) {
  ensureFile(filePath);

  const wanted = new Set([...ids].map(String));
  const found = new Map();
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers;

  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }

    if (!line.trim()) continue;
    const record = toRecord(headers, line);
    const id = String(record[idColumn] || "");
    if (wanted.has(id)) {
      found.set(id, record);
      if (found.size === wanted.size) {
        rl.close();
        stream.destroy();
        break;
      }
    }
  }

  return found;
}

function asNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(String(value || "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeScore(value, min, max) {
  if (max <= min) return 100;
  const normalized = 1 - (value - min) / (max - min);
  return Math.max(0, Math.min(100, Math.round(normalized * 100)));
}

function deriveStatus(score) {
  if (score >= 85) return "shortlisted";
  if (score >= 70) return "under_review";
  return "applied";
}

async function getTrainingSummary() {
  if (!trainingCache) {
    const rows = await readCsvSample(files.training, 5000);
    const total = rows.length || 1;
    const shortlisted = rows.filter((row) => String(row.shortlisted).toLowerCase() === "yes").length;
    const avgSkills = rows.reduce((sum, row) => sum + asNumber(row.skills_match_score), 0) / total;
    const avgExperience = rows.reduce((sum, row) => sum + asNumber(row.years_experience), 0) / total;

    trainingCache = {
      rows: total,
      shortlistedRate: Math.round((shortlisted / total) * 100),
      averageSkillsMatch: Math.round(avgSkills),
      averageExperienceYears: Number(avgExperience.toFixed(1)),
      weights: {
        skillsMatch: 40,
        experience: 25,
        education: 20,
        resumeQuality: 15,
      },
    };
  }

  return trainingCache;
}

async function getApplicationMatches(limit = 25) {
  if (!applicationsCache) {
    applicationsCache = await readCsvSample(files.applications, 1000);
  }

  const rows = applicationsCache.slice(0, Math.max(1, Math.min(limit, 100)));
  const distances = rows.map((row) => asNumber(row.dist_0));
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);
  const cvIds = new Set(rows.map((row) => row.cv_id));
  const jobIds = new Set(rows.map((row) => row.job_0));
  const [cvRows, jobRows, summary] = await Promise.all([
    findRowsById(files.cvs, "cv_id", cvIds),
    findRowsById(files.jobs, "job_id", jobIds),
    getTrainingSummary(),
  ]);

  return rows
    .map((row) => {
      const cv = cvRows.get(String(row.cv_id)) || {};
      const job = jobRows.get(String(row.job_0)) || {};
      const distance = asNumber(row.dist_0);
      const matchScore = normalizeScore(distance, minDistance, maxDistance);
      const skillsText = cv.Skills || cv.crawled_skills || "";
      const skillPreview = skillsText
        .split(/[-;.\n]/)
        .map((skill) => skill.trim())
        .filter(Boolean)
        .slice(0, 4);

      return {
        id: `app-${row.application_id}`,
        applicationId: row.application_id,
        candidateId: row.cv_id,
        candidateName: cv["User Name"] || cv.crawled_name || `Candidate ${row.cv_id}`,
        jobId: row.job_0,
        jobTitle: job["Job Title"] || cv["Desired Job"] || `Job ${row.job_0}`,
        company: job["Name Company"] || "Unknown company",
        atsScore: matchScore,
        status: deriveStatus(matchScore),
        distance,
        skills: skillPreview,
        experience: cv["Work Experience"] || cv.crawled_experience_years || "",
        education: cv.Degree || cv.crawled_education_level || "",
        location: cv.crawled_city || cv["Workplace Desired"] || job["Job Address"] || "",
        reasons: [
          `Nearest-job distance: ${distance}`,
          `Training skills benchmark: ${summary.averageSkillsMatch}%`,
          `Experience benchmark: ${summary.averageExperienceYears} years`,
        ],
      };
    })
    .sort((a, b) => b.atsScore - a.atsScore);
}

function scoreResumeProfile(profile = {}) {
  const skillsMatch = Math.max(0, Math.min(100, asNumber(profile.skillsMatchScore, 0)));
  const yearsExperience = Math.max(0, asNumber(profile.yearsExperience, 0));
  const projectCount = Math.max(0, asNumber(profile.projectCount, 0));
  const resumeLength = Math.max(0, asNumber(profile.resumeLength, 0));
  const githubActivity = Math.max(0, asNumber(profile.githubActivity, 0));
  const education = String(profile.educationLevel || "").toLowerCase();

  const experienceScore = Math.min(100, yearsExperience * 12 + projectCount * 5);
  const educationScore = education.includes("master") || education.includes("phd")
    ? 100
    : education.includes("bachelor")
      ? 85
      : 65;
  const resumeQuality = Math.min(100, resumeLength / 7 + githubActivity / 2);
  const atsScore = Math.round(
    skillsMatch * 0.4 +
    experienceScore * 0.25 +
    educationScore * 0.2 +
    resumeQuality * 0.15,
  );

  return {
    atsScore,
    recommendation: atsScore >= 85 ? "Shortlist" : atsScore >= 70 ? "Review" : "Needs improvement",
    breakdown: {
      skillsMatch,
      experience: Math.round(experienceScore),
      education: educationScore,
      resumeQuality: Math.round(resumeQuality),
    },
  };
}

module.exports = {
  getApplicationMatches,
  getTrainingSummary,
  scoreResumeProfile,
};
