const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidateController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:id", protect, candidateController.getCandidate);
router.put("/:id", protect, candidateController.updateCandidate);router.put("/:id", protect, candidateController.updateCandidate);
router.patch("/:id", protect, candidateController.updateCandidate);router.post("/:id/resumes", protect, candidateController.addResume);
router.get("/:id/resumes", protect, candidateController.getCandidateResumes);
router.get("/:id/applications", protect, candidateController.getCandidateApplications);

module.exports = router;
