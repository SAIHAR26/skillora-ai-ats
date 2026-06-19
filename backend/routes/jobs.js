const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, jobController.listJobs);
router.get("/:id", protect, jobController.getJobById);
router.post("/", protect, jobController.createJob);
router.put("/:id", protect, jobController.updateJob);
router.delete("/:id", protect, jobController.deleteJob);
router.patch("/:id/status", protect, jobController.updateJobStatus);
router.get("/:id/applications", protect, jobController.getJobApplications);

module.exports = router;
