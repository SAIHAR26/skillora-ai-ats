const express = require("express");
const { getMe, listUsers } = require("../controllers/userController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", requireAuth, getMe);
router.get("/", requireAuth, requireRole("admin"), listUsers);

module.exports = router;
