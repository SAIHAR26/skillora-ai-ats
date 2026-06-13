import argparse
import json
import re
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = Path(__file__).resolve().parent / "models"
DATASETS = {
    "applications": ROOT / "applications.csv",
}


TECH_SKILLS = [
    "python", "java", "javascript", "typescript", "react", "node", "sql", "mysql", "mongodb",
    "aws", "azure", "docker", "kubernetes", "tensorflow", "pytorch", "machine learning",
    "nlp", "computer vision", "html", "css", "figma", "graphql", "spring", "flask", "django",
    "excel", "tableau", "power bi", "git", "linux", "rest", "api", "data analysis",
]


def load_json_stdin():
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    return json.loads(raw)


def emit(payload):
    print(json.dumps(payload, ensure_ascii=False))


def clean_id(value):
    if value is None:
        return ""
    if isinstance(value, (float, np.floating)) and np.isfinite(value) and float(value).is_integer():
        return str(int(value))
    text = str(value)
    return text[:-2] if text.endswith(".0") else text


def model_path(name):
    return MODEL_DIR / name


def ensure_models():
    required = [
        "ats_model.pkl",
        "ranking_model.pkl",
        "recommendation_model.pkl",
        "resume_classification_model.pkl",
        "hiring_prediction_model.pkl",
        "model_report.json",
    ]
    missing = [name for name in required if not model_path(name).exists()]
    if missing:
        raise FileNotFoundError(f"Missing trained model artifacts: {', '.join(missing)}. Run backend/ml/train_models.py first.")


def text_features(text):
    text = str(text or "")
    lower = text.lower()
    found = [skill for skill in TECH_SKILLS if skill in lower]
    years = [float(match) for match in re.findall(r"(\d+(?:\.\d+)?)\s*(?:\+?\s*)?(?:years|year|yrs|yr)", lower)]
    project_count = len(re.findall(r"\b(project|built|developed|implemented|created)\b", lower))
    github_activity = 120 if "github" in lower else 25 if "git" in lower else 0
    education = "Masters" if re.search(r"\b(master|m\.s|msc|mba)\b", lower) else "Bachelors" if re.search(r"\b(bachelor|b\.s|b\.tech|degree)\b", lower) else "High School"
    return {
        "years_experience": max(years) if years else 1.0,
        "skills_match_score": min(100, len(found) * 11 + 35),
        "education_level": education,
        "project_count": max(project_count, 1),
        "resume_length": len(text.split()),
        "github_activity": github_activity,
        "found_skills": sorted(set(found)),
    }


def score_resume(payload):
    ensure_models()
    artifact = joblib.load(model_path("ats_model.pkl"))
    resume_text = payload.get("resumeText") or payload.get("text") or ""
    estimated = text_features(resume_text)
    row = {
        "years_experience": payload.get("yearsExperience", estimated["years_experience"]),
        "skills_match_score": payload.get("skillsMatchScore", estimated["skills_match_score"]),
        "education_level": payload.get("educationLevel", estimated["education_level"]),
        "project_count": payload.get("projectCount", estimated["project_count"]),
        "resume_length": payload.get("resumeLength", estimated["resume_length"]),
        "github_activity": payload.get("githubActivity", estimated["github_activity"]),
    }
    frame = pd.DataFrame([row], columns=artifact["features"])
    model = artifact["model"]
    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(frame)[0][1])
    else:
        probability = float(model.predict(frame)[0])
    ats_score = int(round(probability * 100))
    classification = None
    if resume_text.strip():
        class_model = joblib.load(model_path("resume_classification_model.pkl"))["model"]
        classification = str(class_model.predict([resume_text])[0])
    return {
        "atsScore": ats_score,
        "selectionProbability": round(probability, 4),
        "recommendation": "Shortlist" if ats_score >= 85 else "Review" if ats_score >= 70 else "Needs improvement",
        "classification": classification,
        "breakdown": {
            "skillsMatch": int(row["skills_match_score"]),
            "experienceYears": float(row["years_experience"]),
            "projects": int(row["project_count"]),
            "resumeLength": int(row["resume_length"]),
            "educationLevel": row["education_level"],
        },
        "strengths": estimated["found_skills"][:8],
        "suggestions": [
            "Add role-specific keywords from the target job description.",
            "Include measurable achievements and project outcomes.",
            "Mention tools, frameworks, cloud platforms, and version control explicitly.",
        ],
    }


def classify_resume(payload):
    ensure_models()
    text = payload.get("resumeText") or payload.get("text") or ""
    artifact = joblib.load(model_path("resume_classification_model.pkl"))
    label = str(artifact["model"].predict([text])[0]) if text.strip() else "Unknown"
    return {"category": label, "model": artifact["best_model"]}


def rank_candidates(payload):
    ensure_models()
    limit = int(payload.get("limit", 25))
    apps = pd.read_csv(DATASETS["applications"]).head(max(limit * 4, 50))
    artifact = joblib.load(model_path("ranking_model.pkl"))
    features = artifact["features"]
    scores = artifact["model"].predict(apps[features]).clip(0, 100)
    apps = apps.assign(predicted_score=scores).sort_values("predicted_score", ascending=False).head(limit)
    rec_model = joblib.load(model_path("recommendation_model.pkl"))
    cv_index = rec_model["cv_index"]
    jobs = {clean_id(job["job_id"]): job for job in rec_model["job_meta"]}
    rankings = []
    for _, row in apps.iterrows():
        cv_id = clean_id(row["cv_id"])
        job_id = clean_id(row["job_0"])
        application_id = clean_id(row["application_id"])
        cv = cv_index.get(cv_id) or cv_index.get(f"{cv_id}.0") or {}
        job = jobs.get(job_id) or jobs.get(f"{job_id}.0") or {}
        score = int(round(float(row["predicted_score"])))
        rankings.append({
            "id": f"app-{application_id}",
            "applicationId": application_id,
            "candidateId": cv_id,
            "candidateName": cv.get("name") or f"Candidate {cv_id}",
            "jobId": job_id,
            "jobTitle": job.get("Job Title") or cv.get("desired_job") or f"Job {job_id}",
            "company": job.get("Name Company") or "Unknown company",
            "atsScore": score,
            "matchScore": score,
            "status": "shortlisted" if score >= 85 else "under_review" if score >= 70 else "applied",
            "skills": split_skills(cv.get("skills", ""))[:4],
            "experience": "",
            "education": "",
            "location": job.get("Job Address") or "",
            "reasons": [
                f"ML ranking score: {score}",
                f"Best ranking model: {artifact['best_model']}",
                "Score predicted from application distance features.",
            ],
        })
    return {"rankings": rankings, "model": artifact["best_model"]}


def split_skills(text):
    parts = re.split(r"[-;,\n.]+", str(text or ""))
    return [part.strip() for part in parts if part.strip()]


def recommend_jobs(payload):
    ensure_models()
    artifact = joblib.load(model_path("recommendation_model.pkl"))
    cv_id = clean_id(payload.get("cvId", "0"))
    limit = int(payload.get("limit", 5))
    cv = artifact["cv_index"].get(cv_id) or artifact["cv_index"].get(f"{cv_id}.0")
    if cv is None:
        cv = next(iter(artifact["cv_index"].values()))
    distances, indices = artifact["model"].kneighbors([cv["vector"]], n_neighbors=min(limit, 10))
    recommendations = []
    for distance, idx in zip(distances[0], indices[0]):
        job = artifact["job_meta"][int(idx)]
        score = int(round(max(0, min(100, (1 - float(distance)) * 100))))
        recommendations.append({
            "jobId": clean_id(job.get("job_id", "")),
            "title": job.get("Job Title", ""),
            "company": job.get("Name Company", ""),
            "matchScore": score,
            "industry": job.get("Industry", ""),
            "location": job.get("Job Address", ""),
            "reason": "Recommended by cosine similarity over trained CV/job embeddings.",
        })
    return {"candidate": {"cvId": cv_id, "name": cv.get("name", ""), "desiredJob": cv.get("desired_job", "")}, "recommendations": recommendations}


def skill_gap(payload):
    recs = recommend_jobs({"cvId": payload.get("cvId", "0"), "limit": 1})
    ensure_models()
    artifact = joblib.load(model_path("recommendation_model.pkl"))
    cv_id = clean_id(payload.get("cvId", "0"))
    cv = artifact["cv_index"].get(cv_id) or artifact["cv_index"].get(f"{cv_id}.0") or next(iter(artifact["cv_index"].values()))
    job = recs["recommendations"][0] if recs["recommendations"] else {}
    job_meta = next((item for item in artifact["job_meta"] if clean_id(item.get("job_id")) == clean_id(job.get("jobId"))), {})
    cv_skills = {skill.lower() for skill in split_skills(cv.get("skills", ""))}
    job_text = " ".join([str(job_meta.get("Job Requirements", "")), str(job_meta.get("Job Description", "")), str(job_meta.get("Job Title", ""))]).lower()
    required = {skill for skill in TECH_SKILLS if skill in job_text}
    matched = sorted(skill for skill in required if any(skill in owned or owned in skill for owned in cv_skills))
    missing = sorted(required - set(matched))
    return {
        "targetJob": job,
        "matched": [{"skill": skill.title(), "level": 90} for skill in matched[:8]],
        "missing": [{"skill": skill.title(), "recommended": f"Learn {skill.title()} fundamentals"} for skill in missing[:8]],
        "learningPath": [
            {"step": idx + 1, "title": f"{skill.title()} Fundamentals", "duration": "2 weeks", "type": "Course"}
            for idx, skill in enumerate(missing[:5])
        ],
    }


def predict_selection(payload):
    return score_resume(payload)


def model_status():
    ensure_models()
    report = json.loads((MODEL_DIR / "model_report.json").read_text(encoding="utf-8"))
    return {
        "status": "ready",
        "modelDirectory": str(MODEL_DIR),
        "artifacts": sorted(path.name for path in MODEL_DIR.glob("*.pkl")),
        "report": report,
    }


TASKS = {
    "score-resume": score_resume,
    "classify-resume": classify_resume,
    "rank-candidates": rank_candidates,
    "recommend-jobs": recommend_jobs,
    "skill-gap": skill_gap,
    "predict-selection": predict_selection,
    "model-status": lambda payload: model_status(),
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", required=True, choices=sorted(TASKS))
    args = parser.parse_args()
    payload = load_json_stdin()
    emit(TASKS[args.task](payload))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        emit({"error": str(exc)})
        sys.exit(1)
