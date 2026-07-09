const express = require("express");
const {
  listConversations,
  listMessages,
  listUsersByRole,
  markConversationRead,
  sendMessage,
  unreadCounts,
  stream,
} = require("../controllers/messageController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", requireAuth, listUsersByRole);
router.get("/conversations", requireAuth, listConversations);
router.get("/conversations/:participantId", requireAuth, listMessages);
router.get("/unread", requireAuth, unreadCounts);
router.get("/stream", requireAuth, stream);
router.get("/", requireAuth, listMessages);
router.post("/", requireAuth, sendMessage);
router.patch("/conversations/:participantId/read", requireAuth, markConversationRead);

module.exports = router;
