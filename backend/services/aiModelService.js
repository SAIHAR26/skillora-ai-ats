const { spawn, spawnSync } = require("child_process");
const path = require("path");

const pythonScript = path.resolve(__dirname, "..", "ml", "predict.py");
const KNOWN_SKILLS = [
  "python", "java", "javascript", "typescript", "react", "node", "express", "sql", "mysql", "mongodb",
  "aws", "azure", "docker", "kubernetes", "git", "linux", "rest", "api", "machine learning", "data analysis",
  "html", "css", "tailwind", "figma", "tableau", "power bi", "excel", "communication", "leadership",
];

function detectPythonCommand() {
  const candidates = process.platform === "win32" ? ["py", "python", "python3"] : ["python3", "python"];
  for (const command of candidates) {
    try {
      const result = spawnSync(command, ["--version"], { stdio: "ignore" });
      if (result.status === 0) {
        return command;
      }
    } catch (_error) {
      continue;
    }
  }
  return candidates[0];
}
const pythonCommand = detectPythonCommand();

function words(text) {
  return String(text || "").toLowerCase().match(/[a-z0-9+#.]+/g) || [];
}

function unique(items) {
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
}

function detectSkills(text, targetKeywords = []) {
  const lower = String(text || "").toLowerCase();
  return unique([...KNOWN_SKILLS, ...(Array.isArray(targetKeywords) ? targetKeywords : [])]
    .filter((skill) => lower.includes(String(skill).toLowerCase())));
}

function sectionScore(text) {
  const lower = String(text || "").toLowerCase();
  const sections = ["experience", "education", "skills", "projects", "certifications"];
  const present = sections.filter((section) => lower.includes(section)).length;
  return Math.round((present / sections.length) * 100);
}

function scoreResumeFallback(payload = {}) {
  const resumeText = payload.resumeText || payload.text || "";
  const tokenCount = words(resumeText).length;
  const skills = detectSkills(resumeText, payload.targetKeywords);
  const targetKeywords = Array.isArray(payload.targetKeywords) ? payload.targetKeywords : [];
  const lower = String(resumeText).toLowerCase();
  const matchedKeywords = targetKeywords.filter((keyword) => lower.includes(String(keyword).toLowerCase()));
  const missingKeywords = targetKeywords.filter((keyword) => !lower.includes(String(keyword).toLowerCase()));
  const lengthScore = Math.min(100, Math.round((tokenCount / 350) * 100));
  const skillsScore = Math.min(100, skills.length * 12);
  const formatScore = sectionScore(resumeText);
  const suppliedSkillScore = Number(payload.skillsMatchScore || 0);
  const atsScore = Math.max(30, Math.min(98, Math.round(
    (skillsScore * 0.35) +
    (lengthScore * 0.25) +
    (formatScore * 0.2) +
    (Math.min(100, suppliedSkillScore) * 0.2)
  )));
  const suggestions = [];
  if (tokenCount < 250) suggestions.push("Add more measurable project and work experience details.");
  if (formatScore < 80) suggestions.push("Include clear Skills, Experience, Education, and Projects sections.");
  if (missingKeywords.length) suggestions.push(`Add relevant keywords: ${missingKeywords.slice(0, 5).join(", ")}.`);
  if (!suggestions.length) suggestions.push("Keep tailoring this resume to each job description before applying.");

  return {
    atsScore,
    probability: atsScore / 100,
    classification: atsScore >= 70 ? "Recommended" : "Needs improvement",
    recommendation: atsScore >= 70 ? "Strong resume match based on profile and keywords." : "Improve keyword coverage and resume detail before applying.",
    skills,
    strengths: skills.slice(0, 6),
    weaknesses: missingKeywords.slice(0, 6),
    suggestions,
    resumeImprovements: suggestions,
    matchedKeywords,
    missingKeywords,
    breakdown: {
      skills: Math.round(skillsScore),
      resumeLength: Math.round(lengthScore),
      resumeFormat: Math.round(formatScore),
      profileMatch: Math.round(Math.min(100, suppliedSkillScore)),
    },
    atsBreakdown: {
      skills: Math.round(skillsScore),
      resumeLength: Math.round(lengthScore),
      resumeFormat: Math.round(formatScore),
      profileMatch: Math.round(Math.min(100, suppliedSkillScore)),
    },
    experience: { years: Number(payload.yearsExperience || 0) },
    education: payload.educationLevel || "",
    source: "javascript-fallback",
  };
}

function fallbackForTask(task, payload) {
  if (["score-resume", "classify-resume", "rank-candidates", "predict-selection", "recommend-jobs", "skill-gap"].includes(task)) {
    return scoreResumeFallback(payload);
  }
  if (task === "model-status") {
    return {
      available: false,
      source: "javascript-fallback",
      message: "Python ML runtime is unavailable. The backend is using built-in scoring fallbacks.",
      report: { models: {} },
    };
  }
  return null;
}

function isPythonEnvironmentError(message) {
  return /numpy|site-packages|ModuleNotFoundError|ImportError|No module named|Python313|python3\.13/i.test(String(message || ""));
}

function runModelTask(task, payload = {}) {
  return new Promise((resolve, reject) => {
    const fallback = fallbackForTask(task, payload);
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      fn(value);
    };
    let child;
    try {
      child = spawn(pythonCommand, [pythonScript, "--task", task], {
      cwd: path.resolve(__dirname, "..", ".."),
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1",
      },
      windowsHide: true,
      });
    } catch (error) {
      if (fallback) finish(resolve, fallback);
      else finish(reject, error);
      return;
    }

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      if (fallback) finish(resolve, fallback);
      else finish(reject, error);
    });

    child.on("close", (code) => {
      const output = stdout.trim();
      if (!output) {
        if (fallback && (code !== 0 || isPythonEnvironmentError(stderr))) {
          finish(resolve, fallback);
          return;
        }
        finish(reject, new Error(stderr || `ML task ${task} exited with code ${code}`));
        return;
      }

      try {
        const parsed = JSON.parse(output);
        if (parsed.error) {
          if (fallback && isPythonEnvironmentError(parsed.error)) {
            finish(resolve, fallback);
            return;
          }
          finish(reject, new Error(parsed.error));
          return;
        }
        finish(resolve, parsed);
      } catch (error) {
        if (fallback && isPythonEnvironmentError(`${stderr}\n${output}`)) {
          finish(resolve, fallback);
          return;
        }
        finish(reject, new Error(`Failed to parse ML output for ${task}: ${error.message}`));
      }
    });

    try {
      child.stdin.end(JSON.stringify(payload));
    } catch (error) {
      if (fallback) finish(resolve, fallback);
      else finish(reject, error);
    }
  });
}

module.exports = {
  classifyResume: (payload) => runModelTask("classify-resume", payload),
  getModelStatus: () => runModelTask("model-status"),
  predictSelection: (payload) => runModelTask("predict-selection", payload),
  rankCandidates: (payload) => runModelTask("rank-candidates", payload),
  recommendJobs: (payload) => runModelTask("recommend-jobs", payload),
  scoreResume: (payload) => runModelTask("score-resume", payload),
  skillGap: (payload) => runModelTask("skill-gap", payload),
};


