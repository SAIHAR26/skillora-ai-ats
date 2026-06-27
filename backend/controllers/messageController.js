const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");
const Message = require("../models/Message");
const { toClient } = require("../services/platformDataService");

const clients = new Map();
const presence = new Map();

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

function currentParticipant(req) {
  return {
    id: String(req.user?._id || req.auth?.id || ""),
    name: req.user?.name || "User",
    role: req.user?.role || "user",
  };
}

function publicPerson(record, role) {
  const item = toClient(record);
  const userId = item.userId ? String(item.userId) : item.id;
  const status = presence.get(userId);
  return {
    id: userId,
    profileId: item.id,
    name: item.name,
    email: item.email,
    role,
    avatar: item.avatar,
    subtitle: role === "recruiter" ? item.companyName || item.companyEmail || "Recruiter" : item.specialization || item.degree || "Candidate",
    resumeUrl: item.resumeUrl || "",
    online: Boolean(status?.online),
    lastSeen: status?.lastSeen || item.updatedAt || item.createdAt || null,
  };
}

function emitTo(userId, event, payload) {
  const res = clients.get(String(userId));
  if (!res) return;
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

const stream = asyncHandler(async (req, res) => {
  const participant = currentParticipant(req);
  presence.set(participant.id, { online: true, lastSeen: new Date().toISOString() });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  res.write(`event: ready\ndata: ${JSON.stringify({ userId: participant.id })}\n\n`);
  clients.set(participant.id, res);

  req.on("close", () => {
    clients.delete(participant.id);
    presence.set(participant.id, { online: false, lastSeen: new Date().toISOString() });
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const role = req.query.role === "recruiter" ? "recruiter" : "candidate";
  const search = String(req.query.search || "").trim();
  const query = search
    ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] }
    : {};
  const Model = role === "recruiter" ? Recruiter : Candidate;
  const records = await Model.find(query).limit(100).lean();
  res.json({ users: records.map((record) => publicPerson(record, role)) });
});

const conversation = asyncHandler(async (req, res) => {
  const participant = currentParticipant(req);
  const otherId = String(req.params.userId);
  const messages = await Message.find({
    $or: [
      { senderId: participant.id, recipientId: otherId },
      { senderId: otherId, recipientId: participant.id },
    ],
  }).sort({ createdAt: 1 }).limit(250).lean();

  await Message.updateMany({ senderId: otherId, recipientId: participant.id, read: false }, { $set: { read: true } });
  res.json({ messages: messages.map(toClient) });
});

const sendMessage = asyncHandler(async (req, res) => {
  const participant = currentParticipant(req);
  const recipientId = String(req.body.recipientId || "");
  const content = String(req.body.content || "").trim();
  if (!recipientId || !content) {
    return res.status(400).json({ message: "Recipient and message content are required" });
  }

  const message = await Message.create({
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    senderId: participant.id,
    senderName: participant.name,
    senderRole: participant.role,
    recipientId,
    content,
    attachments: Array.isArray(req.body.attachments) ? req.body.attachments : [],
    resumeShared: Boolean(req.body.resumeShared),
    timestamp: new Date().toISOString(),
    read: false,
  });

  const payload = toClient(message);
  emitTo(recipientId, "message", payload);
  emitTo(participant.id, "message", payload);
  res.status(201).json({ message: payload });
});

const unreadCounts = asyncHandler(async (req, res) => {
  const participant = currentParticipant(req);
  const rows = await Message.aggregate([
    { $match: { recipientId: participant.id, read: false } },
    { $group: { _id: "$senderId", count: { $sum: 1 } } },
  ]);
  res.json({ counts: Object.fromEntries(rows.map((row) => [row._id, row.count])) });
});

module.exports = {
  conversation,
  listUsers,
  sendMessage,
  stream,
  unreadCounts,
};
