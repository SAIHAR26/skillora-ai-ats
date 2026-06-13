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
    processed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
