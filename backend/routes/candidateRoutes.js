const express = require("express");
const { listCandidates, updateCandidate } = require("../controllers/candidateController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, listCandidates);
router.patch("/:id", requireAuth, updateCandidate);

module.exports = router;
