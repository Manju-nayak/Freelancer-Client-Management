const express = require("express");
const router = express.Router();
const { getUserProfile, updateProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

router.get("/user/:id", getUserProfile);
router.put("/", protect, updateProfile);

module.exports = router;
