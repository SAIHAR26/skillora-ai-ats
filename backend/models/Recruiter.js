const mongoose = require("mongoose");

const RecruiterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    name: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
    },

    phoneNumber: {
      type: String,
    },

    personalEmail: {
      type: String,
    },

    companyEmail: {
      type: String,
      required: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    companyAddress: {
      type: String,
    },

    companyWebsite: {
      type: String,
    },

    industryType: {
      type: String,
    },

    companySize: {
      type: String,
    },

    roleInCompany: {
      type: String,
    },

    yearsOfExperience: {
      type: Number,
    },

    linkedinProfile: {
      type: String,
    },

    companyId: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    verificationStatus: {
      type: String,
      default: "pending",
    },

    companyDescription: {
      type: String,
    },

    location: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruiter", RecruiterSchema);