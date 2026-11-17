const { query } = require("../config/db");

// @desc    Get tasks for a specific project
// @route   GET /api/tasks/project/:projectId
// @access  Protected
const getProjectTasks = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const sql = `
      SELECT t.*, u.name AS assigned_to_name, m.title AS milestone_title
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      WHERE t.project_id = $1
      ORDER BY 
        CASE t.status
          WHEN 'in-progress' THEN 1
          WHEN 'todo' THEN 2
          WHEN 'review' THEN 3
          WHEN 'completed' THEN 4
        END,
        t.created_at DESC;
    `;
    const { rows } = await query(sql, [projectId]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      tasks: rows
    });
  } catch (error) {
    console.error("Get project tasks error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching tasks" });
  }
};

// @desc    Get all tasks assigned to logged-in freelancer
// @route   GET /api/tasks/my-tasks
// @access  Freelancer only
const getMyTasks = async (req, res) => {
  try {
    const sql = `
      SELECT t.*, p.title AS project_title, m.title AS milestone_title
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      WHERE t.assigned_to = $1
      ORDER BY 
        CASE t.status
          WHEN 'in-progress' THEN 1
          WHEN 'todo' THEN 2
          WHEN 'review' THEN 3
          WHEN 'completed' THEN 4
        END,
        t.due_date ASC;
    `;
    const { rows } = await query(sql, [req.user.id]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      tasks: rows
    });
  } catch (error) {
    console.error("Get my tasks error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching your tasks" });
  }
};

// @desc    Create a task (Client or assigned Freelancer)
// @route   POST /api/tasks
// @access  Protected
const createTask = async (req, res) => {
  try {
    const { projectId, title, description, priority = "medium", dueDate, milestoneId } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({
        success: false,
        message: "Project ID and task title are required."
      });
    }

    const projRes = await query("SELECT client_id, assigned_freelancer_id FROM projects WHERE id = $1;", [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const project = projRes.rows[0];
    if (
      project.client_id !== req.user.id &&
      project.assigned_freelancer_id !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create tasks on this project."
      });
    }

    const assignedTo = project.assigned_freelancer_id || null;

    const sql = `
      INSERT INTO tasks (project_id, assigned_to, milestone_id, title, description, priority, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'todo')
      RETURNING *;
    `;
    const { rows } = await query(sql, [
      projectId,
      assignedTo,
      milestoneId || null,
      title.trim(),
      description || "",
      priority,
      dueDate || null
    ]);

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: rows[0]
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ success: false, message: "Server error creating task" });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Protected
const updateTaskStatus = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!["todo", "in-progress", "review", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be: todo, in-progress, review, or completed"
      });
    }

    const sql = `
      UPDATE tasks
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await query(sql, [status, taskId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Task updated to ${status}`,
      task: rows[0]
    });
  } catch (error) {
    console.error("Update task status error:", error);
    return res.status(500).json({ success: false, message: "Server error updating task" });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Protected
const deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    await query("DELETE FROM tasks WHERE id = $1;", [taskId]);
    return res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ success: false, message: "Server error deleting task" });
  }
};

module.exports = {
  getProjectTasks,
  getMyTasks,
  createTask,
  updateTaskStatus,
  deleteTask
};
