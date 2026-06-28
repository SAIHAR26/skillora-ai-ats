const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  const filters = {};
  if (req.user?.role === "admin" && req.query.userId) {
    filters.userId = req.query.userId;
  } else if (req.user) {
    filters.userId = req.user._id;
  }

  const notifications = await Notification.find(filters).sort({ createdAt: -1 });
  res.json(notifications);
};

exports.markRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  if (req.user?.role !== "admin" && String(notification.userId) !== String(req.user?._id)) {
    return res.status(403).json({ message: "You cannot update another user's notification" });
  }

  notification.status = "read";
  notification.read = true;
  await notification.save();
  res.json({ message: "Notification marked as read", notification });
};

exports.sendNotification = async (req, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Only admins can send arbitrary notifications" });
  }
  const { userId, type, title, message, metadata } = req.body;
  if (!userId || !title || !message) {
    return res.status(400).json({ message: "userId, title, and message are required" });
  }

  const notification = await Notification.create({
    userId,
    type: type || "general",
    title,
    message,
    metadata: metadata || {},
    status: "unread",
  });

  res.status(201).json({ message: "Notification sent", notification });
};
