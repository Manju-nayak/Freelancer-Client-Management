
const express = require("express");
const router = express.Router();

const {
    getMyProfile,
    updateMyProfile
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

// Get logged-in user's profile
router.get("/me", protect, getMyProfile);

// Create or update logged-in user's profile
router.put("/me", protect, updateMyProfile);

module.exports = router;
