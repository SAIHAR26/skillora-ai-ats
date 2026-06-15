const express = require("express");
const router = express.Router();
const opportunityController = require("../controllers/opportunityController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, opportunityController.listOpportunities);
router.post("/", protect, opportunityController.createOpportunity);
router.put("/:id", protect, opportunityController.updateOpportunity);
router.delete("/:id", protect, opportunityController.deleteOpportunity);

module.exports = router;
