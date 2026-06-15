const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Routes
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");

// Load all models
require("./models/User");
require("./models/Recruiter");
require("./models/Candidate");
require("./models/Admin");
require("./models/Job");
require("./models/Application");
require("./models/Resume");
require("./models/Interview");
require("./models/Notification");
require("./models/Complaint");
require("./models/Opportunity");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Database Connection
connectDB();

// Test Routes
app.get("/", (_req, res) => {
  res.send("Skillora backend running successfully");
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "skillora-backend",
  });
});

// AI Routes
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/recruit", recruiterRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);

// Main Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/recruiters", require("./routes/recruiters"));
app.use("/api/candidates", require("./routes/candidates"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/interviews", require("./routes/interviews"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/opportunities", require("./routes/opportunities"));

// Error Handling Middleware (MUST BE LAST)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});