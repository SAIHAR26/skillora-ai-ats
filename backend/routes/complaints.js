const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, complaintController.createComplaint);
router.get("/", protect, complaintController.listComplaints);
router.put("/:id/status", protect, authorize("admin"), complaintController.updateComplaintStatus);

module.exports = router;
