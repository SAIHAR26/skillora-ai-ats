const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");

require("./models/User");
require("./models/Recruiter");
require("./models/Candidate");

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

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Internal server error" });
});

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

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
