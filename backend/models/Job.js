const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    company: String,
    location: String,
    salary: String,
    type: String,
    status: {
      type: String,
      default: "open",
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);