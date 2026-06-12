const mongoose = require("mongoose");

const RecruiterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  companyName: String,
  companyWebsite: String,
  companyDescription: String,
  location: String,
}, { timestamps: true });

module.exports = mongoose.model("Recruiter", RecruiterSchema);