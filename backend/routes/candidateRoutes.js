const express = require("express");
const multer = require("multer");
const {
  addResume,
  getCandidate,
  getCurrentCandidate,
  getCandidateApplications,
  getCandidateResumes,
  listCandidates,
  updateCandidate,
} = require("../controllers/candidateController");
const { requireAuth } = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

router.get("/", requireAuth, listCandidates);
router.get("/me/profile", requireAuth, getCurrentCandidate);
router.get("/:id", requireAuth, getCandidate);
router.patch("/:id", requireAuth, updateCandidate);
router.put("/:id", requireAuth, updateCandidate);
router.post("/:id/resumes", requireAuth, upload.single("resume"), addResume);
router.get("/:id/resumes", requireAuth, getCandidateResumes);
router.get("/:id/applications", requireAuth, getCandidateApplications);

module.exports = router;
