const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const complaintFilter = (id) => (mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id });

exports.createComplaint = async (req, res) => {
  const { subject, message, category, priority } = req.body;
  const userId = req.user?._id || req.body.userId;
  if (!userId || !subject || !message) {
    return res.status(400).json({ message: "subject and message are required" });
  }

  const complaint = await Complaint.create({
    userId,
    userName: req.user?.name,
    userRole: req.user?.role,
    subject,
    message,
    category: category || "other",
    priority: priority || "medium",
    status: "open",
  });

  res.status(201).json({ message: "Complaint submitted", complaint });
};

exports.listComplaints = async (req, res) => {
  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.user?.role === "admin" && req.query.userId) {
    filters.userId = req.query.userId;
  } else if (req.user?.role !== "admin") {
    filters.userId = req.user._id;
  }

  const complaints = await Complaint.find(filters).sort({ createdAt: -1 });
  res.json(complaints);
};

exports.updateComplaintStatus = async (req, res) => {
  const complaint = await Complaint.findOne(complaintFilter(req.params.id));
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  const { status, assignedTo } = req.body;
  if (status) complaint.status = status;
  if (assignedTo) complaint.assignedTo = assignedTo;
  await complaint.save();

  await Notification.create({
    userId: complaint.userId,
    type: "status_update",
    title: "Ticket updated",
    message: `Your ticket "${complaint.subject}" is now ${String(complaint.status).replace(/_/g, " ")}.`,
    metadata: { complaintId: complaint._id, status: complaint.status },
  });

  res.json({ message: "Complaint updated", complaint });
};
