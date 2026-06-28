const express = require("express");
const { conversation, listUsers, sendMessage, stream, unreadCounts } = require("../controllers/messageController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stream", requireAuth, stream);
router.get("/users", requireAuth, listUsers);
router.get("/unread", requireAuth, unreadCounts);
router.get("/conversations/:userId", requireAuth, conversation);
router.post("/", requireAuth, sendMessage);

module.exports = router;
