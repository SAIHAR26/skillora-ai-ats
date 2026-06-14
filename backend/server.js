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

// Models
require("./models/User");
require("./models/Recruiter");
require("./models/Candidate");
require("./models/Job");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// DB connection
connectDB();

// Health check
app.get("/", (req, res) => {
  res.send("Skillora backend running successfully");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "skillora-backend",
    timestamp: new Date(),
  });
});

// Routes
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/recruit", recruiterRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  res.status(500).json({
    message: error.message || "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});