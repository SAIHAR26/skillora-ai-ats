const express = require("express");
const router = express.Router();

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
} = require("../controllers/jobController");

// CREATE JOB
router.post("/", createJob);

// GET ALL JOBS
router.get("/", getJobs);

// GET SINGLE JOB
router.get("/:id", getJobById);

// UPDATE JOB
router.put("/:id", updateJob);

// DELETE JOB
router.delete("/:id", deleteJob);

module.exports = router;