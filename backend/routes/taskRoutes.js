
const express = require("express");
const router = express.Router();

const {
    createTask,
    getMyTasks,
    updateTaskStatus,
    getProjectTasks
} = require("../controllers/taskController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Client creates and assigns a task
router.post(
    "/",
    protect,
    authorizeRoles("client"),
    createTask
);

// Freelancer views assigned tasks
router.get(
    "/my-tasks",
    protect,
    authorizeRoles("freelancer"),
    getMyTasks
);

// Client views tasks belonging to their project
router.get(
    "/project/:projectId",
    protect,
    authorizeRoles("client"),
    getProjectTasks
);

// Freelancer updates assigned task status
router.patch(
    "/:id/status",
    protect,
    authorizeRoles("freelancer"),
    updateTaskStatus
);

module.exports = router;
