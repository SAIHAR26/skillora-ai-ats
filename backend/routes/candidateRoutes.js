const express = require("express");
const {
  addResume,
  getCandidate,
  getCandidateApplications,
  getCandidateResumes,
  listCandidates,
  updateCandidate,
} = require("../controllers/candidateController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, listCandidates);
router.get("/:id", requireAuth, getCandidate);
router.patch("/:id", requireAuth, updateCandidate);
router.put("/:id", requireAuth, updateCandidate);
router.post("/:id/resumes", requireAuth, addResume);
router.get("/:id/resumes", requireAuth, getCandidateResumes);
router.get("/:id/applications", requireAuth, getCandidateApplications);

module.exports = router;
