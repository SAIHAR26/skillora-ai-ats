const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getProfile,
  updateProfile
} = require("../controllers/recruiterController");

// AUTH
router.post("/signup", signup);
router.post("/login", login);

// PROFILE
router.get("/profile/:id", getProfile);
router.put("/profile/:id", updateProfile);

// TEST ROUTE (IMPORTANT)
router.get("/", (req, res) => {
  res.json({
    message: "Recruiter routes working"
  });
});

module.exports = router;