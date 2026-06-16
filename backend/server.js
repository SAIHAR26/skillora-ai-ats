const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const platformRoutes = require("./routes/platformRoutes");

require("./models/User");
require("./models/Recruiter");
require("./models/Candidate");
require("./models/Job");
require("./models/Application");
require("./models/Interview");
require("./models/Message");
require("./models/Notification");
require("./models/Complaint");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

connectDB();

app.get("/", (_req, res) => {
  res.send("Skillora backend running successfully");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "skillora-backend" });
});

app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/platform", platformRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
