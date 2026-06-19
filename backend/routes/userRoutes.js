const express = require("express");
const { deleteUser, getMe, getUserById, listUsers, updateUserStatus } = require("../controllers/userController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", requireAuth, getMe);
router.get("/", requireAuth, requireRole("admin"), listUsers);
router.get("/:id", requireAuth, getUserById);
router.put("/:id/status", requireAuth, requireRole("admin"), updateUserStatus);
router.delete("/:id", requireAuth, requireRole("admin"), deleteUser);

module.exports = router;
