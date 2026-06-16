const express = require("express");
const { getMe, getUserById, listUsers, updateUserStatus } = require("../controllers/userController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", requireAuth, getMe);
router.get("/", requireAuth, requireRole("admin"), listUsers);
router.get("/:id", requireAuth, getUserById);
router.put("/:id/status", requireAuth, requireRole("admin"), updateUserStatus);

module.exports = router;
