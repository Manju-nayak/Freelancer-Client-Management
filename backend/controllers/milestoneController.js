const { query } = require("../config/db");

// @desc    Get milestones for a project
// @route   GET /api/milestones/project/:projectId
// @access  Protected
const getProjectMilestones = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const sql = `
      SELECT m.*, p.title AS project_title, pay.id AS payment_id, pay.status AS payment_status
      FROM milestones m
      JOIN projects p ON m.project_id = p.id
      LEFT JOIN payments pay ON m.id = pay.milestone_id
      WHERE m.project_id = $1
      ORDER BY m.due_date ASC, m.id ASC;
    `;
    const { rows } = await query(sql, [projectId]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      milestones: rows
    });
  } catch (error) {
    console.error("Get project milestones error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching milestones" });
  }
};

// @desc    Create a project milestone (Client only)
// @route   POST /api/milestones
// @access  Client only
const createMilestone = async (req, res) => {
  try {
    const { projectId, title, description, amount, dueDate } = req.body;

    if (!projectId || !title || !amount) {
      return res.status(400).json({
        success: false,
        message: "Project ID, title, and milestone amount are required."
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Milestone amount must be positive."
      });
    }

    const projRes = await query("SELECT client_id FROM projects WHERE id = $1;", [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (projRes.rows[0].client_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only the project owner can create milestones." });
    }

    const sql = `
      INSERT INTO milestones (project_id, title, description, amount, due_date, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *;
    `;
    const { rows } = await query(sql, [
      projectId,
      title.trim(),
      description || "",
      Number(amount),
      dueDate || null
    ]);

    return res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      milestone: rows[0]
    });
  } catch (error) {
    console.error("Create milestone error:", error);
    return res.status(500).json({ success: false, message: "Server error creating milestone" });
  }
};

// @desc    Update milestone status (e.g. submitted, approved, in-progress)
// @route   PATCH /api/milestones/:id/status
// @access  Protected
const updateMilestoneStatus = async (req, res) => {
  try {
    const milestoneId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!["pending", "in-progress", "submitted", "approved", "paid"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone status."
      });
    }

    const sql = `
      UPDATE milestones
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await query(sql, [status, milestoneId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Milestone not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Milestone status updated to ${status}`,
      milestone: rows[0]
    });
  } catch (error) {
    console.error("Update milestone status error:", error);
    return res.status(500).json({ success: false, message: "Server error updating milestone" });
  }
};

module.exports = {
  getProjectMilestones,
  createMilestone,
  updateMilestoneStatus
};
