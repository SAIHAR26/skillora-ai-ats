const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Complaint = require("../models/Complaint");
const Setting = require("../models/Setting");
const jobController = require("./jobController");
const messageController = require("./messageController");
const {
  getCollectionsReport,
  getSnapshot,
  seedIfEmpty,
  toClient,
} = require("../services/platformDataService");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const snapshot = asyncHandler(async (_req, res) => {
  res.json(await getSnapshot());
});

const databaseReport = asyncHandler(async (_req, res) => {
  res.json(await getCollectionsReport());
});

const seed = asyncHandler(async (_req, res) => {
  res.json(await seedIfEmpty());
});

const createApplication = asyncHandler(async (req, res) => {
  const application = await Application.create(req.body);
  await Job.updateOne({ $or: [{ id: req.body.jobId }, { _id: req.body.jobId }] }, { $inc: { applications: 1, totalApplicants: 1 } });
  res.status(201).json({ application: toClient(application) });
});

const updateApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
  if (!application) {
    res.status(404).json({ message: "Application not found" });
    return;
  }
  res.json({ application: toClient(application) });
});

const createInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.create(req.body);
  res.status(201).json({ interview: toClient(interview) });
});

const createMessage = messageController.sendMessage;

const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.body);
  res.status(201).json({ notification: toClient(notification) });
});

const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.create(req.body);
  res.status(201).json({ complaint: toClient(complaint) });
});

const getSettings = asyncHandler(async (_req, res) => {
  const settings = await Setting.find({}).lean();
  const payload = settings.reduce((acc, setting) => ({
    ...acc,
    [setting.key]: setting.value,
  }), {});
  res.json(payload);
});

const updateSettings = asyncHandler(async (req, res) => {
  const updatePayload = req.body || {};
  const keys = Object.keys(updatePayload);
  await Promise.all(
    keys.map((key) =>
      Setting.findOneAndUpdate(
        { key },
        { value: updatePayload[key] },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    ),
  );
  const settings = await Setting.find({}).lean();
  const payload = settings.reduce((acc, setting) => ({
    ...acc,
    [setting.key]: setting.value,
  }), {});
  res.json(payload);
});

module.exports = {
  createApplication,
  createComplaint,
  createInterview,
  createJob: jobController.createJob,
  createMessage,
  createNotification,
  databaseReport,
  deleteJob: jobController.deleteJob,
  getSettings,
  listJobs: jobController.listJobs,
  seed,
  snapshot,
  updateApplication,
  updateJob: jobController.updateJob,
  updateSettings,
};