const express = require("express");
const messageController = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", protect, messageController.listUsersByRole);
router.get("/conversations", protect, messageController.listConversations);
router.get("/conversations/:userId", protect, messageController.getConversation);
router.post("/", protect, messageController.sendMessage);

module.exports = router;
