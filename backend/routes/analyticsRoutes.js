const express = require("express");
const router = express.Router();
const {
  getClientAnalytics,
  getFreelancerAnalytics,
  getAdminAnalytics
} = require("../controllers/analyticsController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/client", protect, authorizeRoles("client", "admin"), getClientAnalytics);
router.get("/freelancer", protect, authorizeRoles("freelancer", "admin"), getFreelancerAnalytics);
router.get("/admin", protect, authorizeRoles("admin"), getAdminAnalytics);

module.exports = router;
