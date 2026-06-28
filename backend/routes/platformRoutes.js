const express = require("express");
const {
  createApplication,
  createComplaint,
  createInterview,
  createJob,
  createMessage,
  createNotification,
  databaseReport,
  deleteJob,
  listJobs,
  seed,
  snapshot,
  updateApplication,
  updateJob,
  getSettings,
  updateSettings,
} = require("../controllers/platformController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/snapshot", snapshot);
router.get("/database-report", databaseReport);
router.post("/seed", requireAuth, requireRole("admin"), seed);

router.get("/jobs", requireAuth, listJobs);
router.post("/jobs", requireAuth, requireRole("recruiter", "admin"), createJob);
router.patch("/jobs/:id", requireAuth, requireRole("recruiter", "admin"), updateJob);
router.delete("/jobs/:id", requireAuth, requireRole("recruiter", "admin"), deleteJob);
router.post("/applications", requireAuth, createApplication);
router.patch("/applications/:id", requireAuth, requireRole("recruiter", "admin"), updateApplication);
router.post("/interviews", requireAuth, requireRole("recruiter", "admin"), createInterview);
router.post("/messages", requireAuth, createMessage);
router.post("/notifications", requireAuth, requireRole("admin"), createNotification);
router.post("/complaints", requireAuth, createComplaint);
router.get("/settings", requireAuth, requireRole("admin"), getSettings);
router.patch("/settings", requireAuth, requireRole("admin"), updateSettings);

module.exports = router;
