const express = require("express");
const cors = require("cors");
require("dotenv").config(); // MUST be first

const connectDB = require("./config/db");

// Load models (optional but good for safety)
require("./models/User");
require("./models/Recruiter");
require("./models/Candidate");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Skillora Backend Running Successfully");
});

// Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});