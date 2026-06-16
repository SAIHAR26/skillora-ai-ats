const express = require("express");
const { getMe, login, logout, register, signup, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ message: "Auth routes working" });
});
router.post("/signup", signup);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;
