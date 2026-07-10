const express = require("express");
let multer = null;
try {
  multer = require("multer");
} catch (_error) {
  multer = null;
}
const {
  addResume,
  getCandidate,
  getCurrentCandidate,
  getCandidateApplications,
  getCandidateResumes,
  getCandidateSkillGapAnalysis,
  listCandidates,
  updateCandidate,
} = require("../controllers/candidateController");
const { requireAuth } = require("../middleware/authMiddleware");

const upload = multer
  ? multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
  : {
      single: () => (_req, _res, next) => next(),
    };
const router = express.Router();

router.get("/", requireAuth, listCandidates);
router.get("/me/profile", requireAuth, getCurrentCandidate);
router.get("/:id", requireAuth, getCandidate);
router.patch("/:id", requireAuth, updateCandidate);
router.put("/:id", requireAuth, updateCandidate);
router.post("/:id/resumes", requireAuth, upload.single("resume"), addResume);
router.get("/:id/resumes", requireAuth, getCandidateResumes);
router.get("/:id/applications", requireAuth, getCandidateApplications);
router.get("/:id/skill-gap", requireAuth, getCandidateSkillGapAnalysis);

module.exports = router;
