
const express = require("express");
const router = express.Router();

const {
    createProject,
    getAllProjects,
    getMyProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require("../controllers/projectController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Create a project - Client only
router.post("/", protect, authorizeRoles("client"), createProject);

// Get all open projects - Logged-in users
router.get("/", protect, getAllProjects);

// Get projects posted by logged-in client
router.get(
    "/my-projects",
    protect,
    authorizeRoles("client"),
    getMyProjects
);

// Get a single project
router.get("/:id", protect, getProjectById);

// Update a project - Client only (ownership checked in controller)
router.put(
    "/:id",
    protect,
    authorizeRoles("client"),
    updateProject
);

// Delete a project - Client only (ownership checked in controller)
router.delete(
    "/:id",
    protect,
    authorizeRoles("client"),
    deleteProject
);

module.exports = router;
