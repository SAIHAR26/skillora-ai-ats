const Complaint = require("../models/Complaint");
const mongoose = require("mongoose");

const complaintFilter = (id) => (mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id });

exports.createComplaint = async (req, res) => {
  const { userId, subject, message, category } = req.body;
  if (!userId || !subject || !message) {
    return res.status(400).json({ message: "userId, subject, and message are required" });
  }

  const complaint = await Complaint.create({
    userId,
    subject,
    message,
    category: category || "other",
    status: "open",
  });

  res.status(201).json({ message: "Complaint submitted", complaint });
};

exports.listComplaints = async (req, res) => {
  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.userId) filters.userId = req.query.userId;

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

  res.json({ message: "Complaint updated", complaint });
};
