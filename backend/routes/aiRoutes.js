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
const { protect } = require("../middleware/authMiddleware");

router.get("/rankings", protect, getRankings);
router.get("/training-summary", protect, getTraining);
router.get("/model-status", protect, getModelStatus);

router.post("/score-resume", protect, scoreResume);
router.post("/classify-resume", protect, classifyResume);
router.post("/rank-candidates", protect, rankCandidates);
router.post("/recommend-jobs", protect, recommendJobs);
router.post("/predict-selection", protect, predictSelection);
router.post("/skill-gap", protect, skillGap);

module.exports = router;
