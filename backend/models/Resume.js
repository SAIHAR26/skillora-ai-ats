const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    originalFileName: { type: String, trim: true },
    storageUrl: { type: String, trim: true },
    contentType: { type: String, trim: true },
    fileSize: { type: Number, default: 0 },
    extractedText: { type: String, trim: true },
    parsedSkills: [{ type: String, trim: true }],
    atsScore: { type: Number, min: 0, max: 100 },
    analysis: { type: Object, default: {} },
    recommendations: [{ type: String, trim: true }],
    extractedExperience: { type: Object, default: {} },
    extractedEducation: { type: Object, default: {} },
    missingKeywords: [{ type: String, trim: true }],
    strengths: [{ type: String, trim: true }],
    weaknesses: [{ type: String, trim: true }],
    processed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
