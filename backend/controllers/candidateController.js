const Candidate = require("../models/Candidate");
const { toClient } = require("../services/platformDataService");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

const listCandidates = asyncHandler(async (req, res) => {
  const query = req.query.search
    ? { $text: { $search: req.query.search } }
    : {};
  const candidates = await Candidate.find(query).limit(100).lean();
  res.json({ candidates: candidates.map(toClient) });
});

const updateCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOneAndUpdate(
    { id: req.params.id },
    req.body,
    { new: true, runValidators: true },
  );
  if (!candidate) {
    res.status(404).json({ message: "Candidate not found" });
    return;
  }
  res.json({ candidate: toClient(candidate) });
});

module.exports = {
  listCandidates,
  updateCandidate,
};
