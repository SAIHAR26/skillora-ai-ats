const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, complaintController.createComplaint);
router.get("/", protect, complaintController.listComplaints);
router.put("/:id/status", protect, complaintController.updateComplaintStatus);

module.exports = router;
