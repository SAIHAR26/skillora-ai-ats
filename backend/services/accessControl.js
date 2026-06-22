const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");

function idVariants(value) {
  if (!value) return [];
  const text = String(value);
  const variants = [value, text];
  if (mongoose.Types.ObjectId.isValid(text)) {
    variants.push(new mongoose.Types.ObjectId(text));
  }
  return [...new Map(variants.map((item) => [String(item), item])).values()];
}

function mixedIdFilter(field, value) {
  return { [field]: { $in: idVariants(value) } };
}

async function getRecruiterForUser(user) {
  if (!user || user.role !== "recruiter") return null;
  return Recruiter.findOne({
    $or: [
      mixedIdFilter("userId", user._id),
      { email: user.email },
    ],
  });
}

async function getCandidateForUser(user) {
  if (!user || user.role !== "candidate") return null;
  return Candidate.findOne({
    $or: [
      mixedIdFilter("userId", user._id),
      { email: user.email },
    ],
  });
}

function ownsMixedId(ownerIds, value) {
  const allowed = new Set(ownerIds.flatMap(idVariants).map(String));
  return allowed.has(String(value));
}

function requireSameUserOrAdmin(req, ownerUserId) {
  if (req.user?.role === "admin") return true;
  return ownsMixedId([req.user?._id], ownerUserId);
}

module.exports = {
  getCandidateForUser,
  getRecruiterForUser,
  idVariants,
  mixedIdFilter,
  ownsMixedId,
  requireSameUserOrAdmin,
};
