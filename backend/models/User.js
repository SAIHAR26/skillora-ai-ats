const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "recruiter", "candidate"],
    default: "candidate",
  },
  status: {
    type: String,
    enum: ["active", "pending", "approved", "rejected", "suspended"],
    default: "active",
  },
}, { timestamps: true });

UserSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model("User", UserSchema);
