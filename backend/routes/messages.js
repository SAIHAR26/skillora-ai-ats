const express = require("express");
const {
  listConversations,
  listMessages,
  listUsersByRole,
  markConversationRead,
  sendMessage,
} = require("../controllers/messageController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", requireAuth, listUsersByRole);
router.get("/conversations", requireAuth, listConversations);
router.get("/", requireAuth, listMessages);
router.post("/", requireAuth, sendMessage);
router.patch("/conversations/:participantId/read", requireAuth, markConversationRead);

module.exports = router;
