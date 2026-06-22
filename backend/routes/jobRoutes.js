const express = require("express");
const router = express.Router();

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
  pauseJob,
  resumeJob,
  closeJob,
  getJobApplications,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

// CREATE JOB
router.post("/", protect, createJob);

// GET ALL JOBS
router.get("/", protect, getJobs);

// GET SINGLE JOB
router.get("/:id", protect, getJobById);

// UPDATE JOB
router.put("/:id", protect, updateJob);
router.patch("/:id/status", protect, updateJobStatus);
router.patch("/:id/pause", protect, pauseJob);
router.patch("/:id/resume", protect, resumeJob);
router.patch("/:id/close", protect, closeJob);
router.get("/:id/applications", protect, getJobApplications);

// DELETE JOB
router.delete("/:id", protect, deleteJob);

module.exports = router;
