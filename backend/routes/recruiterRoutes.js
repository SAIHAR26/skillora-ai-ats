const express = require("express");
const { listRecruiters, updateRecruiterStatus } = require("../controllers/recruiterController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, listRecruiters);
router.patch("/:id/status", requireAuth, requireRole("admin"), updateRecruiterStatus);

module.exports = router;
