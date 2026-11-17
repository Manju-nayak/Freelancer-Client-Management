const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
  getFreelancerRecommendations,
  getProjectFreelancers
} = require("../controllers/projectController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Public / General browse
router.get("/", getAllProjects);

// Vector database recommendations
router.get(
  "/recommendations",
  protect,
  authorizeRoles("freelancer"),
  getFreelancerRecommendations
);

// My projects (client posted or freelancer assigned)
router.get("/my-projects", protect, getMyProjects);

// Project detail
router.get("/:id", getProjectById);

// Vector database recommendations for a project (client only)
router.get(
  "/:id/freelancers",
  protect,
  authorizeRoles("client", "admin"),
  getProjectFreelancers
);

// Project management (client only)
router.post("/", protect, authorizeRoles("client"), createProject);
router.put("/:id", protect, authorizeRoles("client", "admin"), updateProject);
router.delete("/:id", protect, authorizeRoles("client", "admin"), deleteProject);

module.exports = router;
