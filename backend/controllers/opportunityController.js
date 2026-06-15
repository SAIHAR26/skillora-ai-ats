const Opportunity = require("../models/Opportunity");

exports.listOpportunities = async (req, res) => {
  const filters = {};
  if (req.query.type) filters.type = req.query.type;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.category) filters.category = req.query.category;

  const opportunities = await Opportunity.find(filters).sort({ createdAt: -1 });
  res.json(opportunities);
};

exports.createOpportunity = async (req, res) => {
  const { title, description, type, category, startDate, endDate, applyUrl, createdBy, status } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  const opportunity = await Opportunity.create({
    title,
    description,
    type: type || "other",
    category,
    startDate,
    endDate,
    applyUrl,
    createdBy,
    status: status || "active",
  });

  res.status(201).json({ message: "Opportunity created", opportunity });
};

exports.updateOpportunity = async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) {
    return res.status(404).json({ message: "Opportunity not found" });
  }

  const fields = ["title", "description", "type", "category", "startDate", "endDate", "applyUrl", "createdBy", "status"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) opportunity[field] = req.body[field];
  });

  await opportunity.save();
  res.json({ message: "Opportunity updated", opportunity });
};

exports.deleteOpportunity = async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) {
    return res.status(404).json({ message: "Opportunity not found" });
  }

  await opportunity.deleteOne();
  res.json({ message: "Opportunity deleted" });
};
