const { query, transaction } = require("../config/db");

// @desc    Submit a proposal for a project (Freelancer only)
// @route   POST /api/proposals
// @access  Freelancer only
const submitProposal = async (req, res) => {
  try {
    const { projectId, coverLetter, proposedBudget, estimatedDuration } = req.body;

    if (!projectId || !coverLetter || !proposedBudget || !estimatedDuration) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required proposal details: projectId, coverLetter, proposedBudget, estimatedDuration."
      });
    }

    if (Number(proposedBudget) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Proposed budget must be greater than zero."
      });
    }

    // Verify project is open and not owned by freelancer
    const projRes = await query("SELECT id, client_id, status FROM projects WHERE id = $1;", [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const project = projRes.rows[0];
    if (project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: `This project is currently '${project.status}' and cannot receive new proposals.`
      });
    }

    if (project.client_id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot submit a proposal to your own project."
      });
    }

    // Check for existing proposal
    const existing = await query(
      "SELECT id FROM proposals WHERE project_id = $1 AND freelancer_id = $2;",
      [projectId, req.user.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a proposal for this project."
      });
    }

    // Insert proposal
    const insertSql = `
      INSERT INTO proposals (project_id, freelancer_id, cover_letter, proposed_budget, estimated_duration)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows } = await query(insertSql, [
      projectId,
      req.user.id,
      coverLetter.trim(),
      Number(proposedBudget),
      estimatedDuration.trim()
    ]);

    // Create notification for client
    await query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, 'New Proposal Received', $2, 'proposal', $3);`,
      [
        project.client_id,
        `${req.user.name} submitted a proposal for $${Number(proposedBudget).toFixed(2)}.`,
        `/client/proposals?projectId=${projectId}`
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully!",
      proposal: rows[0]
    });
  } catch (error) {
    console.error("Submit proposal error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error submitting proposal"
    });
  }
};

// @desc    Get all proposals submitted by logged-in freelancer
// @route   GET /api/proposals/my-proposals
// @access  Freelancer only
const getMyProposals = async (req, res) => {
  try {
    const sql = `
      SELECT 
        pr.*,
        p.title AS project_title,
        p.budget AS project_budget,
        p.deadline AS project_deadline,
        p.status AS project_status,
        u.name AS client_name
      FROM proposals pr
      JOIN projects p ON pr.project_id = p.id
      JOIN users u ON p.client_id = u.id
      WHERE pr.freelancer_id = $1
      ORDER BY pr.created_at DESC;
    `;
    const { rows } = await query(sql, [req.user.id]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      proposals: rows
    });
  } catch (error) {
    console.error("Get my proposals error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching proposals"
    });
  }
};

// @desc    Get all proposals for a client's project
// @route   GET /api/proposals/project/:projectId
// @access  Client only (must own project) or Admin
const getProjectProposals = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);

    const projRes = await query("SELECT client_id, title FROM projects WHERE id = $1;", [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (projRes.rows[0].client_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only view proposals for your own projects."
      });
    }

    const sql = `
      SELECT 
        pr.*,
        u.name AS freelancer_name,
        u.email AS freelancer_email,
        u.avatar_url AS freelancer_avatar,
        fp.title AS freelancer_title,
        fp.hourly_rate,
        fp.experience_years,
        fp.rating_avg,
        fp.rating_count
      FROM proposals pr
      JOIN users u ON pr.freelancer_id = u.id
      LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
      WHERE pr.project_id = $1
      ORDER BY pr.created_at DESC;
    `;
    const { rows } = await query(sql, [projectId]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      proposals: rows
    });
  } catch (error) {
    console.error("Get project proposals error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching proposals"
    });
  }
};

// @desc    Accept or reject a proposal using ACID SQL Transaction
// @route   PATCH /api/proposals/:id/status
// @access  Client owner only
const updateProposalStatus = async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'accepted' or 'rejected'."
      });
    }

    // Advanced SQL Concept: Multi-statement ACID Transaction
    const result = await transaction(async (txQuery) => {
      // 1. Fetch proposal and project
      const propRes = await txQuery(
        `SELECT pr.*, p.client_id, p.title AS project_title, p.status AS project_status
         FROM proposals pr
         JOIN projects p ON pr.project_id = p.id
         WHERE pr.id = $1;`,
        [proposalId]
      );

      if (propRes.rows.length === 0) {
        throw new Error("Proposal not found.");
      }

      const proposal = propRes.rows[0];

      if (proposal.client_id !== req.user.id && req.user.role !== "admin") {
        const err = new Error("You can only manage proposals for your own projects.");
        err.statusCode = 403;
        throw err;
      }

      if (proposal.status !== "pending") {
        const err = new Error(`This proposal has already been processed (Current status: ${proposal.status}).`);
        err.statusCode = 400;
        throw err;
      }

      if (status === "rejected") {
        // Simple rejection
        await txQuery("UPDATE proposals SET status = 'rejected' WHERE id = $1;", [proposalId]);
        return { message: "Proposal rejected.", status: "rejected" };
      }

      // ACCEPT PROPOSAL FLOW:
      // a) Ensure project is open
      if (proposal.project_status !== "open") {
        const err = new Error(`Cannot accept proposal: Project is already '${proposal.project_status}'.`);
        err.statusCode = 400;
        throw err;
      }

      // b) Accept this proposal
      await txQuery("UPDATE proposals SET status = 'accepted' WHERE id = $1;", [proposalId]);

      // c) Reject all other pending proposals for this project
      await txQuery(
        "UPDATE proposals SET status = 'rejected' WHERE project_id = $1 AND id != $2 AND status = 'pending';",
        [proposal.project_id, proposalId]
      );

      // d) Update project status to 'in-progress' and assign freelancer
      await txQuery(
        "UPDATE projects SET status = 'in-progress', assigned_freelancer_id = $1 WHERE id = $2;",
        [proposal.freelancer_id, proposal.project_id]
      );

      // e) Auto-create default milestone if project has none
      const mCheck = await txQuery("SELECT COUNT(*) AS total FROM milestones WHERE project_id = $1;", [proposal.project_id]);
      if (parseInt(mCheck.rows[0].total, 10) === 0) {
        await txQuery(
          `INSERT INTO milestones (project_id, title, description, amount, due_date, status)
           VALUES ($1, 'Initial Project Delivery', 'Complete agreed deliverables according to project scope.', $2, CURRENT_DATE + INTERVAL '30 days', 'in-progress');`,
          [proposal.project_id, proposal.proposed_budget]
        );
      }

      // f) Send notification to assigned freelancer
      await txQuery(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES ($1, 'Proposal Accepted!', $2, 'success', $3);`,
        [
          proposal.freelancer_id,
          `Congratulations! Your proposal for "${proposal.project_title}" has been accepted. You are now assigned to the project.`,
          `/freelancer/tasks`
        ]
      );

      // g) Record in system audit log
      await txQuery(
        `INSERT INTO audit_logs (entity_type, entity_id, action, details)
         VALUES ('proposal', $1, 'PROPOSAL_ACCEPTED_AND_ASSIGNED', $2);`,
        [
          proposalId,
          `Assigned Freelancer #${proposal.freelancer_id} to Project #${proposal.project_id} at budget $${proposal.proposed_budget}`
        ]
      );

      return {
        message: "Proposal accepted successfully! Freelancer assigned and project moved to in-progress.",
        status: "accepted"
      };
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      status: result.status
    });
  } catch (error) {
    console.error("Update proposal status error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error updating proposal status"
    });
  }
};

module.exports = {
  submitProposal,
  getMyProposals,
  getProjectProposals,
  updateProposalStatus
};
