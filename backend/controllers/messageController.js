const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Recruiter = require("../models/Recruiter");
const User = require("../models/User");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const participantId = (user) => String(user?._id || user?.id || "");

const listUsersByRole = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const allowedRoles = ["recruiter", "candidate", "admin"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "role must be recruiter, candidate, or admin" });
  }

  const filter = { role, status: { $in: ["active", "approved", "pending"] } };
  if (search) {
    const regex = new RegExp(String(search), "i");
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const users = await User.find(filter).select("name email role status lastLoginAt").sort({ name: 1 }).limit(100).lean();
  const enhancedUsers = role === "recruiter" && users.length > 0 ? users : users;

  if (role !== "recruiter" || users.length === 0) {
    return res.json({ users: enhancedUsers });
  }

  const userIds = users.map((user) => user._id);
  const emails = users.map((user) => user.email).filter(Boolean);
  const recruiters = await Recruiter.find({ $or: [{ userId: { $in: userIds } }, { email: { $in: emails } }] }).lean();
  const byUserId = new Map(recruiters.map((recruiter) => [String(recruiter.userId), recruiter]));
  const byEmail = new Map(recruiters.map((recruiter) => [String(recruiter.email || "").toLowerCase(), recruiter]));

  return res.json({ users: users.map((user) => {
    const recruiter = byUserId.get(String(user._id)) || byEmail.get(String(user.email || "").toLowerCase());
    return {
      ...user,
      avatar: recruiter?.avatar || recruiter?.companyLogoUrl || "",
      company: recruiter?.companyName || "",
      companyName: recruiter?.companyName || "",
      roleInCompany: recruiter?.roleInCompany || recruiter?.role || "Recruiter",
    };
  }) });
});

const listConversations = asyncHandler(async (req, res) => {
  const userId = participantId(req.user);
  const messages = await Message.find({ $or: [{ senderId: userId }, { recipientId: userId }] }).sort({ createdAt: -1 }).lean();
  const byUser = new Map();

  messages.forEach((message) => {
    const otherId = message.senderId === userId ? message.recipientId : message.senderId;
    if (!byUser.has(otherId)) {
      byUser.set(otherId, {
        participantId: otherId,
        lastMessage: message,
        unreadCount: 0,
      });
    }
    if (message.recipientId === userId && !message.read) {
      byUser.get(otherId).unreadCount += 1;
    }
  });

  return res.json(Array.from(byUser.values()));
});

const listMessages = asyncHandler(async (req, res) => {
  const userId = participantId(req.user);
  const otherId = String(req.params.participantId || req.query.with || "");
  if (!otherId) {
    return res.status(400).json({ message: "participantId path parameter or with query parameter is required" });
  }

  const messages = await Message.find({
    $or: [
      { senderId: userId, recipientId: otherId },
      { senderId: otherId, recipientId: userId },
    ],
  }).sort({ createdAt: 1 }).lean();

  return res.json({ messages });
});

const sendMessage = asyncHandler(async (req, res) => {
  const senderId = participantId(req.user);
  const { recipientId, content, attachments, resumeUrl } = req.body;
  if (!recipientId || !String(content || "").trim()) {
    return res.status(400).json({ message: "recipientId and content are required" });
  }

  const message = await Message.create({
    senderId,
    senderName: req.user.name,
    senderRole: req.user.role,
    recipientId,
    content: String(content).trim(),
    attachments: Array.isArray(attachments) ? attachments : [],
    resumeUrl,
    read: false,
  });

  await Notification.create({
    userId: recipientId,
    type: "new_message",
    title: "New message",
    message: `${req.user.name} sent you a message.`,
    metadata: { messageId: message._id, senderId },
  });

  return res.status(201).json({ message });
});

const unreadCounts = asyncHandler(async (req, res) => {
  const userId = participantId(req.user);
  const unread = await Message.aggregate([
    { $match: { recipientId: userId, read: false } },
    { $group: { _id: "$senderId", count: { $sum: 1 } } },
  ]);
  const counts = unread.reduce((acc, item) => ({ ...acc, [String(item._id)]: item.count }), {});
  res.json({ counts });
});

const stream = asyncHandler(async (req, res) => {
  const userId = participantId(req.user);
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  res.write(`retry: 10000\n\n`);

  const interval = setInterval(async () => {
    const messages = await Message.find({ recipientId: userId, read: false }).sort({ createdAt: 1 }).lean();
    if (messages.length > 0) {
      res.write(`data: ${JSON.stringify(messages)}\n\n`);
    }
  }, 10000);

  req.on("close", () => clearInterval(interval));
});

const markConversationRead = asyncHandler(async (req, res) => {
  const userId = participantId(req.user);
  const otherId = String(req.params.participantId || "");
  await Message.updateMany({ senderId: otherId, recipientId: userId, read: false }, { read: true });
  return res.json({ message: "Conversation marked as read" });
});

module.exports = {
  listConversations,
  listMessages,
  listUsersByRole,
  markConversationRead,
  sendMessage,
  unreadCounts,
  stream,
};
