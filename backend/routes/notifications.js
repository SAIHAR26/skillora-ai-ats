const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, notificationController.getNotifications);
router.put("/:id/read", protect, notificationController.markRead);
router.post("/send", protect, notificationController.sendNotification);

module.exports = router;
