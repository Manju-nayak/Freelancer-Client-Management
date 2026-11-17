const express = require("express");
const router = express.Router();
const {
  createReview,
  getFreelancerReviews,
  getMyReviews
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createReview);
router.get("/freelancer/:id", getFreelancerReviews);
router.get("/my-reviews", protect, getMyReviews);

module.exports = router;
