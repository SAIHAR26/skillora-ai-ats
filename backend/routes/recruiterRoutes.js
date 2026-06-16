const express = require("express");
const {
  getRecruiter,
  getRecruiterApplications,
  getRecruiterJobs,
  listRecruiters,
  updateRecruiter,
  updateRecruiterStatus,
} = require("../controllers/recruiterController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, listRecruiters);
router.get("/:id", requireAuth, getRecruiter);
router.patch("/:id", requireAuth, updateRecruiter);
router.put("/:id", requireAuth, updateRecruiter);
router.patch("/:id/status", requireAuth, requireRole("admin"), updateRecruiterStatus);
router.get("/:id/jobs", requireAuth, getRecruiterJobs);
router.get("/:id/applications", requireAuth, getRecruiterApplications);

module.exports = router;
