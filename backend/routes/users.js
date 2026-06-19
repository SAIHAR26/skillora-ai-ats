const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/:id", protect, userController.getUserById);
router.get("/", protect, authorize("admin"), userController.getUsers);
router.put("/:id/status", protect, authorize("admin"), userController.updateUserStatus);
router.delete("/:id", protect, authorize("admin"), userController.deleteUser);

module.exports = router;
