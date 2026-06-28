const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applications");
const interviewRoutes = require("./routes/interviews");
const notificationRoutes = require("./routes/notifications");
const complaintRoutes = require("./routes/complaints");
const messageRoutes = require("./routes/messageRoutes");
const platformRoutes = require("./routes/platformRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Models (register schemas)
require("./models/User");
require("./models/Recruiter");
require("./models/Candidate");
require("./models/Admin");
require("./models/Job");
require("./models/Application");
require("./models/Resume");
require("./models/Interview");
require("./models/Message");
require("./models/Notification");
require("./models/Complaint");
require("./models/Opportunity");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// DB connect
connectDB();

// Basic routes
app.get("/", (req, res) => {
  res.send("Skillora backend running successfully");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/ai", aiRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});