import json
import re
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor, RandomForestClassifier, RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, mean_absolute_error, precision_score, r2_score, recall_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.neighbors import NearestNeighbors
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import LinearSVC


ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


DATASETS = {
    "ats": ROOT / "ai_resume_screening.csv",
    "resume_classification": ROOT / "Resume Screening.csv",
    "applications": ROOT / "applications.csv",
    "cvs": ROOT / "cv_data.csv",
    "jobs": ROOT / "job_data.csv",
    "hr": ROOT / "HR_Analytics.csv",
}


def to_jsonable(value):
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, dict):
        return {key: to_jsonable(val) for key, val in value.items()}
    if isinstance(value, list):
        return [to_jsonable(item) for item in value]
    return value


def dataset_status():
    status = {}
    for name, path in DATASETS.items():
        if not path.exists():
            status[name] = {"found": False}
            continue
        preview = pd.read_csv(path, nrows=1)
        status[name] = {
            "found": True,
            "file": path.name,
            "size_mb": round(path.stat().st_size / 1024 / 1024, 2),
            "columns": list(preview.columns),
        }
    return status


def classification_metrics(model, x_train, x_test, y_train, y_test):
    model.fit(x_train, y_train)
    pred = model.predict(x_test)
    labels = sorted(pd.Series(y_test).dropna().unique().tolist())
    average = "binary" if len(labels) == 2 else "weighted"
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, pd.concat([x_train, x_test]), pd.concat([y_train, y_test]), cv=cv, scoring="f1_weighted")
    return {
        "accuracy": accuracy_score(y_test, pred),
        "precision": precision_score(y_test, pred, average=average, zero_division=0),
        "recall": recall_score(y_test, pred, average=average, zero_division=0),
        "f1": f1_score(y_test, pred, average=average, zero_division=0),
        "confusion_matrix": confusion_matrix(y_test, pred, labels=labels).tolist(),
        "labels": labels,
        "cross_validation_f1": {
            "mean": float(np.mean(cv_scores)),
            "scores": cv_scores.tolist(),
        },
    }


def train_ats_model(report):
    df = pd.read_csv(DATASETS["ats"])
    df = df.dropna(subset=["shortlisted"]).copy()
    df["target"] = df["shortlisted"].astype(str).str.strip().str.lower().map({"yes": 1, "no": 0})
    df = df.dropna(subset=["target"])
    numeric = ["years_experience", "skills_match_score", "project_count", "resume_length", "github_activity"]
    categorical = ["education_level"]
    x = df[numeric + categorical]
    y = df["target"].astype(int)

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), numeric),
            ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical),
        ]
    )
    candidates = {
        "logistic_regression": LogisticRegression(max_iter=1000),
        "random_forest": RandomForestClassifier(n_estimators=160, random_state=42, class_weight="balanced"),
        "gradient_boosting": GradientBoostingClassifier(random_state=42),
    }
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)
    results = {}
    best_name = None
    best_f1 = -1.0
    best_model = None
    for name, estimator in candidates.items():
        model = Pipeline([("preprocessor", preprocessor), ("model", estimator)])
        metrics = classification_metrics(model, x_train, x_test, y_train, y_test)
        results[name] = metrics
        if metrics["f1"] > best_f1:
            best_f1 = metrics["f1"]
            best_name = name
            best_model = model

    best_model.fit(x, y)
    joblib.dump({"model": best_model, "features": numeric + categorical, "best_model": best_name}, MODEL_DIR / "ats_model.pkl")
    joblib.dump({"model": best_model, "features": numeric + categorical, "best_model": best_name}, MODEL_DIR / "screening_model.pkl")
    report["models"]["ats_model"] = {"task": "ATS score and candidate selection", "best_model": best_name, "rows": len(df), "candidates": results}
    report["models"]["screening_model"] = report["models"]["ats_model"]


def train_resume_classifier(report):
    df = pd.read_csv(DATASETS["resume_classification"])
    df = df.dropna(subset=["Category", "Resume"]).copy()
    x = df["Resume"].astype(str)
    y = df["Category"].astype(str)
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)
    candidates = {
        "tfidf_logistic_regression": LogisticRegression(max_iter=1200),
        "tfidf_linear_svc": LinearSVC(),
    }
    results = {}
    best_name = None
    best_f1 = -1.0
    best_model = None
    for name, estimator in candidates.items():
        model = Pipeline([
            ("tfidf", TfidfVectorizer(max_features=18000, ngram_range=(1, 2), stop_words="english", min_df=2)),
            ("model", estimator),
        ])
        metrics = classification_metrics(model, x_train, x_test, y_train, y_test)
        results[name] = metrics
        if metrics["f1"] > best_f1:
            best_f1 = metrics["f1"]
            best_name = name
            best_model = model

    best_model.fit(x, y)
    joblib.dump({"model": best_model, "best_model": best_name}, MODEL_DIR / "resume_classification_model.pkl")
    report["models"]["resume_classification_model"] = {
        "task": "Resume classification",
        "best_model": best_name,
        "rows": len(df),
        "classes": sorted(y.unique().tolist()),
        "candidates": results,
    }


def train_ranking_model(report):
    apps = pd.read_csv(DATASETS["applications"])
    dist_cols = [col for col in apps.columns if col.startswith("dist_")]
    apps[dist_cols] = apps[dist_cols].apply(pd.to_numeric, errors="coerce")
    max_dist = apps["dist_0"].quantile(0.95)
    apps["match_score"] = (100 * (1 - apps["dist_0"].clip(0, max_dist) / max_dist)).fillna(0).clip(0, 100)
    x = apps[dist_cols].fillna(apps[dist_cols].median())
    y = apps["match_score"]
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
    candidates = {
        "random_forest_regressor": RandomForestRegressor(n_estimators=140, random_state=42),
        "gradient_boosting_regressor": GradientBoostingRegressor(random_state=42),
    }
    results = {}
    best_name = None
    best_score = -999.0
    best_model = None
    for name, estimator in candidates.items():
        model = Pipeline([("imputer", SimpleImputer(strategy="median")), ("model", estimator)])
        model.fit(x_train, y_train)
        pred = model.predict(x_test).clip(0, 100)
        r2 = r2_score(y_test, pred)
        results[name] = {
            "r2": r2,
            "mae": mean_absolute_error(y_test, pred),
            "accuracy": None,
            "precision": None,
            "recall": None,
            "f1": None,
            "confusion_matrix": None,
            "cross_validation_r2": cross_val_score(model, x, y, cv=5, scoring="r2").tolist(),
        }
        if r2 > best_score:
            best_score = r2
            best_name = name
            best_model = model

    best_model.fit(x, y)
    joblib.dump({"model": best_model, "features": dist_cols, "best_model": best_name}, MODEL_DIR / "ranking_model.pkl")
    report["models"]["ranking_model"] = {"task": "Candidate ranking and AI match scoring", "best_model": best_name, "rows": len(apps), "candidates": results}


def train_recommendation_model(report):
    emb_cols = [f"emb_{i}" for i in range(768)]
    job_cols = ["job_id", "Job Title", "Name Company", "Job Requirements", "Job Description", "Industry", "Job Address"] + emb_cols
    cv_cols = ["cv_id", "User Name", "Skills", "crawled_skills", "Desired Job", "crawled_cv_title"] + emb_cols
    jobs = pd.read_csv(DATASETS["jobs"], usecols=lambda col: col in job_cols)
    cvs = pd.read_csv(DATASETS["cvs"], usecols=lambda col: col in cv_cols)
    jobs[emb_cols] = jobs[emb_cols].apply(pd.to_numeric, errors="coerce").fillna(0).astype("float32")
    cvs[emb_cols] = cvs[emb_cols].apply(pd.to_numeric, errors="coerce").fillna(0).astype("float32")
    job_vectors = jobs[emb_cols].to_numpy(dtype="float32")
    model = NearestNeighbors(n_neighbors=10, metric="cosine", algorithm="brute")
    model.fit(job_vectors)
    job_meta = jobs.drop(columns=emb_cols).fillna("").to_dict("records")
    cv_index = {
        str(row["cv_id"]): {
            "name": row.get("User Name", ""),
            "skills": row.get("Skills", "") or row.get("crawled_skills", ""),
            "desired_job": row.get("Desired Job", "") or row.get("crawled_cv_title", ""),
            "vector": row[emb_cols].to_numpy(dtype="float32"),
        }
        for _, row in cvs.iterrows()
    }
    joblib.dump({"model": model, "job_meta": job_meta, "cv_index": cv_index}, MODEL_DIR / "recommendation_model.pkl", compress=3)

    apps = pd.read_csv(DATASETS["applications"])
    sample = apps.head(500)
    hits = 0
    evaluated = 0
    for _, row in sample.iterrows():
        cv = cv_index.get(str(row["cv_id"]))
        if cv is None:
            continue
        _, indices = model.kneighbors([cv["vector"]], n_neighbors=10)
        recommended_ids = {str(job_meta[idx]["job_id"]) for idx in indices[0]}
        hits += int(str(row["job_0"]) in recommended_ids)
        evaluated += 1
    report["models"]["recommendation_model"] = {
        "task": "Job recommendation and skill gap matching",
        "best_model": "nearest_neighbors_cosine_embeddings",
        "rows": {"jobs": len(jobs), "cvs": len(cvs), "evaluation_applications": evaluated},
        "candidates": {
            "nearest_neighbors_cosine_embeddings": {
                "top_10_hit_rate": hits / evaluated if evaluated else 0,
                "accuracy": hits / evaluated if evaluated else 0,
                "precision": None,
                "recall": None,
                "f1": None,
                "confusion_matrix": None,
                "cross_validation": None,
            }
        },
    }


def train_hiring_prediction(report):
    df = pd.read_csv(DATASETS["hr"])
    if "Attrition" not in df.columns:
        return
    y = df["Attrition"].astype(str).str.lower().map({"yes": 1, "no": 0})
    x = df.drop(columns=["Attrition", "EmpID"], errors="ignore")
    numeric = x.select_dtypes(include=[np.number]).columns.tolist()
    categorical = [col for col in x.columns if col not in numeric]
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), numeric),
            ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical),
        ]
    )
    model = Pipeline([("preprocessor", preprocessor), ("model", RandomForestClassifier(n_estimators=160, random_state=42, class_weight="balanced"))])
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)
    metrics = classification_metrics(model, x_train, x_test, y_train, y_test)
    model.fit(x, y)
    joblib.dump({"model": model, "features": list(x.columns), "target": "attrition_risk"}, MODEL_DIR / "hiring_prediction_model.pkl")
    report["models"]["hiring_prediction_model"] = {
        "task": "Hiring/retention risk prediction from HR analytics",
        "best_model": "random_forest_classifier",
        "rows": len(df),
        "candidates": {"random_forest_classifier": metrics},
    }


def main():
    report = {
        "generated_at": pd.Timestamp.utcnow().isoformat(),
        "datasets": dataset_status(),
        "models": {},
        "notes": [
            "XGBoost, LightGBM, and sentence-transformer models were not used because the repository has no local dependency for them and network access is unavailable.",
            "Ranking labels are derived from provided nearest-job distances in applications.csv.",
            "Recommendation uses the provided 768-dimensional CV/job embeddings with cosine nearest neighbors.",
        ],
    }
    train_ats_model(report)
    train_resume_classifier(report)
    train_ranking_model(report)
    train_recommendation_model(report)
    train_hiring_prediction(report)
    (MODEL_DIR / "model_report.json").write_text(json.dumps(to_jsonable(report), indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(to_jsonable({"status": "trained", "models": list(report["models"].keys())}), ensure_ascii=False))


if __name__ == "__main__":
    main()
