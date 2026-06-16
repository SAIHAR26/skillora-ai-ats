const Recruiter = require("../models/Recruiter");
const { toClient } = require("../services/platformDataService");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

const listRecruiters = asyncHandler(async (req, res) => {
  const query = req.query.status ? { status: req.query.status } : {};
  const recruiters = await Recruiter.find(query).limit(100).lean();
  res.json({ recruiters: recruiters.map(toClient) });
});

const updateRecruiterStatus = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOneAndUpdate(
    { id: req.params.id },
    { status: req.body.status },
    { new: true, runValidators: true },
  );
  if (!recruiter) {
    res.status(404).json({ message: "Recruiter not found" });
    return;
  }
  res.json({ recruiter: toClient(recruiter) });
});

module.exports = {
  listRecruiters,
  updateRecruiterStatus,
};
