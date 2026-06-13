const express = require("express");
const {
  classifyResume,
  getModelStatus,
  getRankings,
  getTraining,
  predictSelection,
  rankCandidates,
  recommendJobs,
  scoreResume,
  skillGap,
} = require("../controllers/aiController");

const router = express.Router();

router.get("/rankings", getRankings);
router.get("/training-summary", getTraining);
router.get("/model-status", getModelStatus);

router.post("/score-resume", scoreResume);
router.post("/classify-resume", classifyResume);
router.post("/rank-candidates", rankCandidates);
router.post("/recommend-jobs", recommendJobs);
router.post("/predict-selection", predictSelection);
router.post("/skill-gap", skillGap);

module.exports = router;
