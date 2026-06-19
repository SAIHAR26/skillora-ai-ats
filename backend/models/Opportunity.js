const mongoose = require("mongoose");

const OpportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["hackathon", "quiz", "competition", "internship", "job", "other"], default: "other" },
    category: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    applyUrl: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Opportunity", OpportunitySchema);
