const Job = require("../models/Job");
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const { getRecruiterForUser, idVariants, ownsMixedId } = require("../services/accessControl");

const objectOrLegacyFilter = (id) => (id && id.match && id.match(/^[a-f\d]{24}$/i) ? { _id: id } : { id });
const activeJobStatuses = ["open", "active"];

function parseSkills(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function visibleJobFilterForUser(req, filters = {}) {
  if (req.user?.role === "candidate") {
    filters.published = true;
    filters.active = true;
    filters.status = { $in: activeJobStatuses };
  }
  return filters;
}

async function assertRecruiterOwnsJob(req, job) {
  if (req.user?.role === "admin") return true;
  if (req.user?.role !== "recruiter") return false;
  const recruiter = await getRecruiterForUser(req.user);
  return recruiter && ownsMixedId([recruiter._id, recruiter.id], job.recruiterId);
}

exports.listJobs = async (req, res) => {
  const filters = visibleJobFilterForUser(req, {});
  const { recruiterId, status, location, employmentType, jobType, type, title, company, skill, skills, experienceLevel, experience, search } = req.query;

  if (req.user?.role === "recruiter") {
    const recruiter = await getRecruiterForUser(req.user);
    if (!recruiter) return res.status(404).json({ message: "Recruiter profile not found" });
    filters.recruiterId = { $in: idVariants(recruiter._id).concat(idVariants(recruiter.id)) };
  } else if (recruiterId) {
    filters.recruiterId = { $in: idVariants(recruiterId) };
  }
  if (status) filters.status = status;
  if (location) filters.location = new RegExp(location, "i");
  if (employmentType || jobType || type) {
    const value = employmentType || jobType || type;
    filters.$or = [...(filters.$or || []), { employmentType: new RegExp(value, "i") }, { type: new RegExp(value, "i") }];
  }
  if (title) filters.title = new RegExp(title, "i");
  if (company) filters.company = new RegExp(company, "i");
  if (experienceLevel || experience) {
    const value = experienceLevel || experience;
    filters.$or = [...(filters.$or || []), { experienceLevel: new RegExp(value, "i") }, { experience: new RegExp(value, "i") }];
  }
  if (skill || skills) {
    const value = skill || skills;
    filters.$or = [...(filters.$or || []), { skillsRequired: { $in: [new RegExp(value, "i")] } }, { skills: { $in: [new RegExp(value, "i")] } }];
  }
  if (search) {
    const regex = new RegExp(search, "i");
    filters.$or = [
      ...(filters.$or || []),
      { title: regex },
      { company: regex },
      { location: regex },
      { experienceLevel: regex },
      { experience: regex },
      { employmentType: regex },
      { type: regex },
      { skillsRequired: { $in: [regex] } },
      { skills: { $in: [regex] } },
    ];
  }

  const jobs = await Job.find(filters).sort({ createdAt: -1 });
  res.json(jobs);
};

exports.getJobs = exports.listJobs;

exports.getJobById = async (req, res) => {
  const filter = objectOrLegacyFilter(req.params.id);
  const job = await Job.findOne(filter);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  if (req.user?.role === "candidate" && (!job.active || !job.published || !activeJobStatuses.includes(job.status))) {
    return res.status(404).json({ message: "Job not found" });
  }
  if (req.user?.role === "recruiter" && !(await assertRecruiterOwnsJob(req, job))) {
    return res.status(404).json({ message: "Job not found" });
  }
  res.json(job);
};

exports.createJob = async (req, res) => {
  if (req.user?.role !== "recruiter" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Only recruiters can create jobs" });
  }

  const recruiter = req.user?.role === "recruiter" ? await getRecruiterForUser(req.user) : null;
  const recruiterId = recruiter?._id || req.body.recruiterId;
  const { title, description, skillsRequired, skills, salaryRange, salary, location, employmentType, jobType, type, applicationDeadline, experienceLevel, experience } = req.body;

  if (!recruiterId || !title || !description) {
    return res.status(400).json({ message: "Recruiter, title, and description are required" });
  }

  const job = await Job.create({
    recruiterId,
    title,
    description,
    company: req.body.company || recruiter?.companyName,
    skillsRequired: parseSkills(skillsRequired || skills),
    skills: parseSkills(skills || skillsRequired),
    experienceLevel,
    experience: experience || experienceLevel,
    salaryRange: salaryRange || {},
    salary,
    location,
    employmentType: employmentType || jobType,
    type,
    applicationDeadline,
    published: true,
    status: "open",
    active: true,
  });

  if (recruiter?.userId) {
    await Notification.create({
      userId: recruiter.userId,
      type: "general",
      title: "Job posted",
      message: `${job.title} was posted successfully.`,
      metadata: { jobId: job._id },
    });
  }

  res.status(201).json({ message: "Job created", job });
};

exports.updateJob = async (req, res) => {
  const job = await Job.findOne(objectOrLegacyFilter(req.params.id));
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (!(await assertRecruiterOwnsJob(req, job))) {
    return res.status(403).json({ message: "You cannot manage another recruiter's job" });
  }

  const updateFields = [
    "title",
    "description",
    "skillsRequired",
    "skills",
    "experienceLevel",
    "experience",
    "salaryRange",
    "salary",
    "location",
    "employmentType",
    "type",
    "applicationDeadline",
    "published",
    "status",
    "active",
  ];

  updateFields.forEach((field) => {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  });

  if (req.body.skillsRequired !== undefined) job.skillsRequired = parseSkills(req.body.skillsRequired);
  if (req.body.skills !== undefined) job.skills = parseSkills(req.body.skills);

  await job.save();
  res.json({ message: "Job updated", job });
};

exports.deleteJob = async (req, res) => {
  const job = await Job.findOne(objectOrLegacyFilter(req.params.id));
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  if (!(await assertRecruiterOwnsJob(req, job))) {
    return res.status(403).json({ message: "You cannot delete another recruiter's job" });
  }

  await job.deleteOne();
  res.json({ message: "Job deleted" });
};

exports.updateJobStatus = async (req, res) => {
  const job = await Job.findOne(objectOrLegacyFilter(req.params.id));
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  if (!(await assertRecruiterOwnsJob(req, job))) {
    return res.status(403).json({ message: "You cannot manage another recruiter's job" });
  }

  const { status, published } = req.body;
  if (status) {
    job.status = status;
    if (status === "paused") job.published = false;
    if (status === "open" || status === "active") {
      job.active = true;
      job.published = true;
    }
    if (status === "closed" || status === "archived") {
      job.active = false;
      job.published = false;
    }
  }
  if (published !== undefined) {
    job.published = published;
  }
  await job.save();
  res.json({ message: "Job status updated", job });
};

exports.pauseJob = async (req, res) => {
  req.body = { ...req.body, status: "paused", published: false };
  return exports.updateJobStatus(req, res);
};

exports.resumeJob = async (req, res) => {
  req.body = { ...req.body, status: "open", published: true };
  return exports.updateJobStatus(req, res);
};

exports.closeJob = async (req, res) => {
  req.body = { ...req.body, status: "closed", published: false };
  return exports.updateJobStatus(req, res);
};

exports.getJobApplications = async (req, res) => {
  const job = await Job.findOne(objectOrLegacyFilter(req.params.id));
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  if (!(await assertRecruiterOwnsJob(req, job))) {
    return res.status(403).json({ message: "You cannot view another recruiter's applications" });
  }

  const applications = await Application.find({ jobId: { $in: idVariants(job._id).concat(idVariants(job.id)) } }).sort({ appliedAt: -1 });
  res.json(applications);
};
