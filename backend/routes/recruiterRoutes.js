const express = require("express");
const {
  getRecruiter,
  deleteRecruiter,
  getRecruiterApplications,
  getRecruiterAnalytics,
  getRecruiterJobs,
  listRecruiters,
  updateRecruiter,
  updateRecruiterStatus,
} = require("../controllers/recruiterController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), listRecruiters);
router.get("/:id", requireAuth, getRecruiter);
router.patch("/:id", requireAuth, updateRecruiter);
router.put("/:id", requireAuth, updateRecruiter);
router.patch("/:id/status", requireAuth, requireRole("admin"), updateRecruiterStatus);
router.delete("/:id", requireAuth, requireRole("admin"), deleteRecruiter);
router.get("/:id/jobs", requireAuth, getRecruiterJobs);
router.get("/:id/applications", requireAuth, getRecruiterApplications);
router.get("/:id/analytics", requireAuth, getRecruiterAnalytics);

module.exports = router;
