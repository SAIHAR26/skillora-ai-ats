const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");

function currentUserId(req) {
  return String(req.user._id);
}

exports.listUsersByRole = async (req, res) => {
  const { role, search } = req.query;
  if (!["candidate", "recruiter"].includes(role)) {
    return res.status(400).json({ message: "role must be candidate or recruiter" });
  }

  const filter = { role, status: { $in: ["active", "approved"] } };
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const users = await User.find(filter).select("name email role status lastLoginAt").limit(50).lean();
  res.json({
    users: users.map((user) => ({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      online: false,
      lastSeen: user.lastLoginAt || null,
    })),
  });
};

exports.listConversations = async (req, res) => {
  const userId = currentUserId(req);
  const messages = await Message.find({
    $or: [{ senderId: userId }, { recipientId: userId }],
  }).sort({ createdAt: -1 }).lean();

  const byUser = new Map();
  messages.forEach((message) => {
    const otherId = message.senderId === userId ? message.recipientId : message.senderId;
    if (!byUser.has(otherId)) {
      byUser.set(otherId, {
        userId: otherId,
        lastMessage: message,
        unreadCount: 0,
      });
    }
    if (message.recipientId === userId && !message.read) {
      byUser.get(otherId).unreadCount += 1;
    }
  });

  res.json({ conversations: [...byUser.values()] });
};

exports.getConversation = async (req, res) => {
  const userId = currentUserId(req);
  const otherUserId = String(req.params.userId);
  const messages = await Message.find({
    $or: [
      { senderId: userId, recipientId: otherUserId },
      { senderId: otherUserId, recipientId: userId },
    ],
  }).sort({ createdAt: 1 });

  await Message.updateMany({ senderId: otherUserId, recipientId: userId, read: false }, { $set: { read: true, readAt: new Date() } });
  res.json({ messages });
};

exports.sendMessage = async (req, res) => {
  const { recipientId, content, attachments } = req.body;
  if (!recipientId || !content) {
    return res.status(400).json({ message: "recipientId and content are required" });
  }

  const recipient = await User.findById(recipientId).select("role name");
  if (!recipient) return res.status(404).json({ message: "Recipient not found" });

  const message = await Message.create({
    senderId: currentUserId(req),
    senderName: req.user.name,
    senderRole: req.user.role,
    recipientId: String(recipient._id),
    recipientRole: recipient.role,
    content,
    attachments: Array.isArray(attachments) ? attachments : [],
  });

  await Notification.create({
    userId: recipient._id,
    type: "new_message",
    title: "New message",
    message: `${req.user.name} sent you a message.`,
    metadata: { messageId: message._id, senderId: req.user._id },
  });

  res.status(201).json({ message: "Message sent", data: message });
};

