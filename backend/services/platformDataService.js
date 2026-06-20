const mongoose = require("mongoose");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Complaint = require("../models/Complaint");
const seedData = require("../data/seedData");
const { hashPassword } = require("./authService");

const collections = {
  users: User,
  candidates: Candidate,
  recruiters: Recruiter,
  jobs: Job,
  applications: Application,
  interviews: Interview,
  messages: Message,
  notifications: Notification,
  complaints: Complaint,
};

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

function toClient(doc) {
  if (!doc) return doc;
  const value = typeof doc.toObject === "function" ? doc.toObject() : doc;
  const { _id, __v, ...rest } = value;
  return { id: rest.id || String(_id), ...rest };
}

async function seedIfEmpty() {
  if (!isMongoReady()) return { seeded: false, reason: "MongoDB is not connected" };

  const existingDataCount = await Promise.all([
    Candidate.countDocuments(),
    Recruiter.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Interview.countDocuments(),
    Message.countDocuments(),
    Notification.countDocuments(),
    Complaint.countDocuments(),
  ]).then((counts) => counts.reduce((total, count) => total + count, 0));

  await ensureSeedLoginAccounts();
  await ensureSeedProfiles();
  await repairIncompleteProfiles();

  if (existingDataCount > 0) {
    return { seeded: false, reason: "MongoDB already contains platform data" };
  }

  const users = [
    { name: "Admin User", email: "admin@skillora.com", passwordHash: await hashPassword("AdminPass123!"), role: "admin", status: "active", profileCompleted: true },
    ...(await Promise.all(seedData.candidates.map(async (candidate) => ({
      name: candidate.name,
      email: candidate.email,
      passwordHash: await hashPassword("CandidatePass123!"),
      role: "candidate",
      status: candidate.status,
      profileCompleted: true,
    })))),
    ...(await Promise.all(seedData.recruiters.map(async (recruiter) => ({
      name: recruiter.name,
      email: recruiter.email,
      passwordHash: await hashPassword("SecurePassword123!"),
      role: "recruiter",
      status: recruiter.status === "approved" ? "active" : recruiter.status,
      profileCompleted: true,
    })))),
  ];

  await User.updateMany(
    { passwordHash: { $exists: false }, password: { $exists: true } },
    [{ $set: { passwordHash: "$password" } }, { $unset: "password" }],
    { updatePipeline: true },
  );

  await Promise.all([
    upsertSeed(User, users, "email"),
    upsertSeed(Candidate, seedData.candidates),
    upsertSeed(Recruiter, seedData.recruiters),
    upsertSeed(Job, seedData.jobs),
    upsertSeed(Application, seedData.applications),
    upsertSeed(Interview, seedData.interviews),
    upsertSeed(Message, seedData.messages),
    upsertSeed(Notification, seedData.notifications),
    upsertSeed(Complaint, seedData.complaints),
  ]);

  return { seeded: true };
}

async function ensureSeedLoginAccounts() {
  const accounts = [
    { name: "Admin User", email: "admin@skillora.com", password: "AdminPass123!", role: "admin", status: "active" },
    { name: "Jane Smith", email: "jane.smith@gmail.com", password: "CandidatePass123!", role: "candidate", status: "active" },
    { name: "John Doe", email: "recruiter@company.com", password: "SecurePassword123!", role: "recruiter", status: "active" },
    { name: "Lasya", email: "lasya@skillora.com", password: "LasyaPass123!", role: "candidate", status: "active" },
  ];

  await Promise.all(
    accounts.map(async (account) => {
      const existing = await User.findOne({ email: account.email }).select("+passwordHash +password");
      const passwordHash = await hashPassword(account.password);
      if (existing) {
        existing.name = account.name;
        existing.role = account.role;
        existing.status = account.status;
        existing.profileCompleted = true;
        existing.passwordHash = passwordHash;
        existing.password = undefined;
        await existing.save();
        return;
      }

      await User.create({
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
        status: account.status,
        profileCompleted: true,
      });
    }),
  );
}

async function ensureSeedProfiles() {
  await Promise.all([
    Candidate.updateOne(
      { id: "cand-1" },
      {
        $set: {
          ...seedData.candidates[0],
          name: "Jane Smith",
          email: "jane.smith@gmail.com",
          phone: "+1-555-0456",
          phoneNumber: "+1-555-0456",
        },
      },
      { upsert: true },
    ),
    Candidate.updateOne(
      { id: "cand-lasya" },
      { $set: seedData.candidates.find((candidate) => candidate.id === "cand-lasya") },
      { upsert: true },
    ),
    Candidate.updateMany(
      { name: /^lasya$/i },
      { $set: seedData.candidates.find((candidate) => candidate.id === "cand-lasya") },
    ),
    Recruiter.updateOne(
      { id: "rec-1" },
      {
        $set: {
          ...seedData.recruiters[0],
          name: "John Doe",
          email: "recruiter@company.com",
          phone: "+1-555-0123",
          phoneNumber: "+1-555-0123",
          companyName: "Tech Solutions Inc",
          companyEmail: "john.doe@techsolutions.com",
        },
      },
      { upsert: true },
    ),
  ]);
}
async function repairIncompleteProfiles() {
  const candidateFallbacks = ["/images/candidate-lasya.jpg", "/images/candidate-1.jpg", "/images/candidate-2.jpg"];
  const recruiterFallbacks = ["/images/recruiter-1.jpg", "/images/recruiter-2.jpg"];
  const [candidates, recruiters] = await Promise.all([Candidate.find({}).lean(), Recruiter.find({}).lean()]);

  await Promise.all([
    ...candidates.map((candidate, index) => {
      const seedMatch = seedData.candidates.find((item) => item.email === candidate.email || item.name === candidate.name || item.id === candidate.id);
      const isLasya = String(candidate.name || "").toLowerCase() === "lasya" || candidate.email === "lasya@skillora.com";
      const source = isLasya ? seedData.candidates.find((item) => item.id === "cand-lasya") : seedMatch;
      const updates = {};

      if (isLasya && source) Object.assign(updates, source);
      if (!candidate.avatar) updates.avatar = source?.avatar || candidateFallbacks[index % candidateFallbacks.length];
      if (!candidate.specialization) updates.specialization = source?.specialization || candidate.degree || "Software Engineering";
      if (!Array.isArray(candidate.skills) || candidate.skills.length === 0) updates.skills = source?.skills || ["JavaScript", "React", "SQL"];
      if (!candidate.atsScore || Number.isNaN(Number(candidate.atsScore))) updates.atsScore = source?.atsScore || 80;
      if (!candidate.resumeUrl) updates.resumeUrl = source?.resumeUrl || "";

      if (Object.keys(updates).length === 0) return Promise.resolve();
      return Candidate.updateOne({ _id: candidate._id }, { $set: updates });
    }),
    ...recruiters.map((recruiter, index) => {
      const seedMatch = seedData.recruiters.find((item) => item.email === recruiter.email || item.name === recruiter.name || item.id === recruiter.id);
      const updates = {};

      if (!recruiter.avatar) updates.avatar = seedMatch?.avatar || recruiterFallbacks[index % recruiterFallbacks.length];
      if (!recruiter.companyName) updates.companyName = seedMatch?.companyName || recruiter.company || "Skillora Hiring Partner";
      if (!recruiter.role) updates.role = seedMatch?.role || recruiter.roleInCompany || "Recruiter";
      if (recruiter.hiredCount === undefined || recruiter.hiredCount === null || Number.isNaN(Number(recruiter.hiredCount))) updates.hiredCount = seedMatch?.hiredCount || 0;

      if (Object.keys(updates).length === 0) return Promise.resolve();
      return Recruiter.updateOne({ _id: recruiter._id }, { $set: updates });
    }),
  ]);
}

function withCandidateDefaults(candidate, index = 0) {
  const fallbackAvatar = String(candidate.name || "").toLowerCase() === "lasya" ? "/images/candidate-lasya.jpg" : index % 2 === 0 ? "/images/candidate-1.jpg" : "/images/candidate-2.jpg";
  return {
    ...candidate,
    avatar: candidate.avatar || fallbackAvatar,
    role: candidate.specialization || candidate.degree || "Software Engineering",
    atsScore: Number(candidate.atsScore) || 80,
    skills: Array.isArray(candidate.skills) && candidate.skills.length ? candidate.skills : ["JavaScript", "React", "SQL"],
  };
}

function withRecruiterDefaults(recruiter, index = 0) {
  return {
    ...recruiter,
    avatar: recruiter.avatar || (index % 2 === 0 ? "/images/recruiter-1.jpg" : "/images/recruiter-2.jpg"),
    companyName: recruiter.companyName || recruiter.company || "Skillora Hiring Partner",
    role: recruiter.role || recruiter.roleInCompany || "Recruiter",
    hiredCount: Number(recruiter.hiredCount) || 0,
  };
}
async function upsertSeed(Model, records, key = "id") {
  if (!records.length) return;
  await Model.bulkWrite(
    records.map((record) => ({
      updateOne: {
        filter: { [key]: record[key] },
        update: { $setOnInsert: record },
        upsert: true,
      },
    })),
    { ordered: false },
  );
}

async function listCollection(Model, query = {}, limit = 100) {
  if (!isMongoReady()) return [];
  return (await Model.find(query).limit(limit).lean()).map(toClient);
}

async function getCollectionsReport() {
  if (!isMongoReady()) {
    return {
      connected: false,
      collections: [],
      emptyCollections: Object.keys(collections),
      dataQualityIssues: ["MongoDB connection is unavailable in this runtime."],
    };
  }

  const entries = await Promise.all(
    Object.entries(collections).map(async ([name, Model]) => ({
      name,
      count: await Model.countDocuments(),
      indexes: await Model.collection.indexes(),
    })),
  );

  return {
    connected: true,
    collections: entries,
    emptyCollections: entries.filter((entry) => entry.count === 0).map((entry) => entry.name),
    dataQualityIssues: entries.some((entry) => entry.count === 0)
      ? ["One or more collections are empty; run POST /api/platform/seed."]
      : [],
  };
}

async function getSnapshot() {
  await seedIfEmpty();

  const [
    candidates,
    recruiters,
    jobs,
    applications,
    interviews,
    messages,
    notifications,
    complaints,
  ] = await Promise.all([
    listCollection(Candidate, {}, 100),
    listCollection(Recruiter, {}, 100),
    listCollection(Job, {}, 100),
    listCollection(Application, {}, 250),
    listCollection(Interview, {}, 100),
    listCollection(Message, {}, 100),
    listCollection(Notification, {}, 100),
    listCollection(Complaint, {}, 100),
  ]);

  const analytics = buildAnalytics(applications, interviews);
  const adminStats = {
    totalCandidates: candidates.length,
    totalRecruiters: recruiters.length,
    totalJobs: jobs.length,
    totalApplications: applications.length,
    interviewsScheduled: interviews.filter((item) => item.status === "scheduled").length,
    hiredCandidates: applications.filter((item) => item.status === "selected").length,
    rejectedCandidates: applications.filter((item) => item.status === "rejected").length,
  };

  const recruiterStats = {
    totalActiveJobs: jobs.filter((item) => item.status === "active").length,
    totalApplications: applications.length,
    shortlistedCandidates: applications.filter((item) => item.status === "shortlisted").length,
    interviewsScheduled: interviews.filter((item) => item.status === "scheduled").length,
    hiredCandidates: applications.filter((item) => item.status === "selected").length,
    aiRecommendations: applications.filter((item) => item.atsScore >= 85).length,
  };

  const candidateApplications = applications.filter((item) => item.candidateId === "cand-1");
  const candidate = candidates.find((item) => item.id === "cand-1") || candidates[0];
  const candidateStats = {
    atsScore: candidate?.atsScore || 0,
    jobsApplied: candidateApplications.length,
    interviewsScheduled: interviews.filter((item) => item.candidateId === "cand-1" && item.status === "scheduled").length,
    profileCompletion: candidate ? calculateProfileCompletion(candidate) : 0,
    aiCareerMatch: Math.max(0, Math.min(100, candidate?.atsScore + 5 || 0)),
  };

  return {
    adminStats,
    analytics,
    applications,
    candidates,
    candidateStats,
    complaints,
    interviews,
    jobs,
    messages,
    notifications,
    recruiters,
    recruiterStats,
    topCandidates: [...candidates]
      .map(withCandidateDefaults)
      .filter((candidate) => candidate.name)
      .sort((a, b) => b.atsScore - a.atsScore)
      .slice(0, 4)
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        role: candidate.role,
        atsScore: candidate.atsScore,
        skills: candidate.skills.slice(0, 3),
        avatar: candidate.avatar,
      })),
    topRecruiters: [...recruiters]
      .map(withRecruiterDefaults)
      .filter((recruiter) => recruiter.name)
      .sort((a, b) => b.hiredCount - a.hiredCount)
      .slice(0, 3)
      .map((recruiter) => ({
        id: recruiter.id,
        name: recruiter.name,
        company: recruiter.companyName,
        role: recruiter.role,
        hires: recruiter.hiredCount,
        avatar: recruiter.avatar,
      })),
  };
}

function buildAnalytics(applications, interviews) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month, index) => {
    const monthNumber = String(index + 1).padStart(2, "0");
    const apps = applications.filter((item) => item.appliedDate?.slice(5, 7) === monthNumber);
    const ints = interviews.filter((item) => item.date?.slice(5, 7) === monthNumber);
    return {
      month,
      applications: apps.length,
      interviews: ints.length,
      hires: apps.filter((item) => item.status === "selected").length,
      rejections: apps.filter((item) => item.status === "rejected").length,
    };
  });
}

function calculateProfileCompletion(candidate) {
  const fields = ["name", "email", "phone", "college", "degree", "specialization", "graduationYear", "cgpa", "location", "linkedin", "github", "resumeUrl"];
  const filled = fields.filter((field) => {
    const value = candidate[field];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== "";
  }).length + (candidate.skills?.length ? 1 : 0);
  return Math.round((filled / (fields.length + 1)) * 100);
}

module.exports = {
  collections,
  getCollectionsReport,
  getSnapshot,
  isMongoReady,
  seedIfEmpty,
  toClient,
};
