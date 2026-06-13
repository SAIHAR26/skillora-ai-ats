const express = require("express");
const router = express.Router();
const recruiterController = require("../controllers/recruiterController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:id", protect, recruiterController.getRecruiter);
router.put("/:id", protect, recruiterController.updateRecruiter);
router.get("/:id/jobs", protect, recruiterController.getRecruiterJobs);
router.get("/:id/applications", protect, recruiterController.getRecruiterApplications);

module.exports = router;
