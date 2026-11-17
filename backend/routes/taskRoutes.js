const express = require("express");
const router = express.Router();
const {
  getProjectTasks,
  getMyTasks,
  createTask,
  updateTaskStatus,
  deleteTask
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

router.get("/project/:projectId", protect, getProjectTasks);
router.get("/my-tasks", protect, getMyTasks);
router.post("/", protect, createTask);
router.patch("/:id/status", protect, updateTaskStatus);
router.delete("/:id", protect, deleteTask);

module.exports = router;
