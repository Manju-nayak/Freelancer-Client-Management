const express = require("express");
const router = express.Router();
const {
  getProjectMilestones,
  createMilestone,
  updateMilestoneStatus
} = require("../controllers/milestoneController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/project/:projectId", protect, getProjectMilestones);
router.post("/", protect, authorizeRoles("client", "admin"), createMilestone);
router.patch("/:id/status", protect, updateMilestoneStatus);

module.exports = router;
