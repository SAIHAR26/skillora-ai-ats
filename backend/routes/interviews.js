const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, interviewController.createInterview);
router.get("/:id", protect, interviewController.getInterviewById);
router.get("/", protect, interviewController.listInterviews);
router.put("/:id", protect, interviewController.updateInterview);
router.patch("/:id/status", protect, interviewController.updateInterviewStatus);

module.exports = router;
