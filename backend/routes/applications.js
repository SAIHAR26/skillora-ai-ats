const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, applicationController.createApplication);
router.get("/:id", protect, applicationController.getApplication);
router.get("/", protect, applicationController.listApplications);
router.put("/:id/status", protect, applicationController.updateApplicationStatus);
router.put("/:id/remarks", protect, applicationController.updateApplicationRemarks);
router.delete("/:id", protect, applicationController.deleteApplication);

module.exports = router;
