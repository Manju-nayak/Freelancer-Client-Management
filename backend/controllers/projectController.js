const { query, transaction } = require("../config/db");
const {
  generateProjectEmbedding,
  recommendProjectsForFreelancer,
  recommendFreelancersForProject
} = require("../services/vectorService");

// @desc    Get all projects with Full-Text Search & Filters
// @route   GET /api/projects
// @access  Public / Logged-in
const getAllProjects = async (req, res) => {
  try {
    const { q, category, status, minBudget, maxBudget, limit = 20, offset = 0 } = req.query;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Full-Text Search using PostgreSQL GIN index & tsvector
    if (q && q.trim()) {
      conditions.push(`(p.search_vector @@ plainto_tsquery('english', $${paramIndex}) OR p.title ILIKE $${paramIndex + 1} OR p.description ILIKE $${paramIndex + 1})`);
      params.push(q.trim());
      params.push(`%${q.trim()}%`);
      paramIndex += 2;
    }

    if (category && category !== "All") {
      conditions.push(`p.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (status && status !== "All") {
      conditions.push(`p.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (minBudget) {
      conditions.push(`p.budget >= $${paramIndex}`);
      params.push(Number(minBudget));
      paramIndex++;
    }

    if (maxBudget) {
      conditions.push(`p.budget <= $${paramIndex}`);
      params.push(Number(maxBudget));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) AS total FROM projects p ${whereClause};`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    const listSql = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.category,
        p.budget,
        p.budget_type,
        p.deadline,
        p.experience_level,
        p.status,
        p.created_at,
        u.id AS client_id,
        u.name AS client_name,
        u.email AS client_email,
        u_free.name AS freelancer_name,
        COALESCE(prop.proposals_count, 0) AS proposals_count
      FROM projects p
      JOIN users u ON p.client_id = u.id
      LEFT JOIN users u_free ON p.assigned_freelancer_id = u_free.id
      LEFT JOIN (
        SELECT project_id, COUNT(*) AS proposals_count
        FROM proposals
        GROUP BY project_id
      ) prop ON p.id = prop.project_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    params.push(Number(limit), Number(offset));
    const { rows } = await query(listSql, params);

    // Fetch skills for these projects
    const projectIds = rows.map(r => r.id);
    let skillsMap = {};
    if (projectIds.length > 0) {
      const skillsSql = `
        SELECT ps.project_id, s.name
        FROM project_skills ps
        JOIN skills s ON ps.skill_id = s.id
        WHERE ps.project_id = ANY($1::int[]);
      `;
      const skillsRes = await query(skillsSql, [projectIds]);
      skillsRes.rows.forEach(item => {
        if (!skillsMap[item.project_id]) skillsMap[item.project_id] = [];
        skillsMap[item.project_id].push(item.name);
      });
    }

    const projectsWithSkills = rows.map(p => ({
      ...p,
      skills: skillsMap[p.id] || []
    }));

    return res.status(200).json({
      success: true,
      total,
      count: rows.length,
      projects: projectsWithSkills
    });
  } catch (error) {
    console.error("Get all projects error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching projects"
    });
  }
};

// @desc    Get project by ID with full details
// @route   GET /api/projects/:id
// @access  Protected
const getProjectById = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);

    const projectSql = `
      SELECT 
        p.*,
        u_client.name AS client_name,
        u_client.email AS client_email,
        cp.company_name,
        u_free.name AS freelancer_name,
        u_free.email AS freelancer_email
      FROM projects p
      JOIN users u_client ON p.client_id = u_client.id
      LEFT JOIN client_profiles cp ON u_client.id = cp.user_id
      LEFT JOIN users u_free ON p.assigned_freelancer_id = u_free.id
      WHERE p.id = $1;
    `;
    const { rows } = await query(projectSql, [projectId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const project = rows[0];

    // Fetch skills
    const skillsRes = await query(
      `SELECT s.id, s.name, s.category
       FROM project_skills ps
       JOIN skills s ON ps.skill_id = s.id
       WHERE ps.project_id = $1;`,
      [projectId]
    );

    // Fetch milestones
    const milestonesRes = await query(
      "SELECT * FROM milestones WHERE project_id = $1 ORDER BY due_date ASC;",
      [projectId]
    );

    // Fetch tasks
    const tasksRes = await query(
      `SELECT t.*, u.name AS assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1 ORDER BY t.created_at ASC;`,
      [projectId]
    );

    // Fetch deliverables
    const deliverablesRes = await query(
      "SELECT * FROM project_deliverables WHERE project_id = $1 ORDER BY submitted_at DESC;",
      [projectId]
    );

    // Fetch proposal count
    const propCountRes = await query(
      "SELECT COUNT(*) AS total FROM proposals WHERE project_id = $1;",
      [projectId]
    );

    return res.status(200).json({
      success: true,
      project: {
        ...project,
        skills: skillsRes.rows.map(s => s.name),
        milestones: milestonesRes.rows,
        tasks: tasksRes.rows,
        deliverables: deliverablesRes.rows,
        proposalsCount: parseInt(propCountRes.rows[0].total, 10)
      }
    });
  } catch (error) {
    console.error("Get project by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching project details"
    });
  }
};

// @desc    Get projects posted by logged-in client or assigned to freelancer
// @route   GET /api/projects/my-projects
// @access  Protected
const getMyProjects = async (req, res) => {
  try {
    let sql;
    let params = [req.user.id];

    if (req.user.role === "client") {
      sql = `
        SELECT * FROM view_project_summaries
        WHERE client_id = $1
        ORDER BY created_at DESC;
      `;
    } else {
      sql = `
        SELECT * FROM view_project_summaries
        WHERE freelancer_id = $1
        ORDER BY created_at DESC;
      `;
    }

    const { rows } = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      projects: rows
    });
  } catch (error) {
    console.error("Get my projects error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching your projects"
    });
  }
};

// @desc    Create a new project (Client only)
// @route   POST /api/projects
// @access  Client only
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skillsRequired,
      budget,
      budgetType = "fixed",
      deadline,
      experienceLevel = "intermediate"
    } = req.body;

    if (!title || !description || !category || !budget || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required project fields: title, description, category, budget, deadline."
      });
    }

    if (Number(budget) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Budget must be a positive number."
      });
    }

    // Generate pgvector embedding (384-dimensional vector)
    const embedding = generateProjectEmbedding({
      title,
      category,
      description,
      skills: Array.isArray(skillsRequired) ? skillsRequired : [skillsRequired]
    });

    const result = await transaction(async (txQuery) => {
      // 1. Insert Project (search_vector tsvector is automatically computed by database trigger!)
      const projRes = await txQuery(
        `INSERT INTO projects 
         (client_id, title, description, category, budget, budget_type, deadline, experience_level, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::vector)
         RETURNING *;`,
        [
          req.user.id,
          title.trim(),
          description.trim(),
          category.trim(),
          Number(budget),
          budgetType,
          deadline,
          experienceLevel,
          embedding
        ]
      );
      const newProject = projRes.rows[0];

      // 2. Associate Skills
      if (Array.isArray(skillsRequired) && skillsRequired.length > 0) {
        for (const skillName of skillsRequired) {
          const sRes = await txQuery(
            `INSERT INTO skills (name, category)
             VALUES ($1, $2)
             ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
             RETURNING id;`,
            [skillName.trim(), category.trim()]
          );
          const skillId = sRes.rows[0].id;

          await txQuery(
            `INSERT INTO project_skills (project_id, skill_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING;`,
            [newProject.id, skillId]
          );
        }
      }

      return newProject;
    });

    return res.status(201).json({
      success: true,
      message: "Project created and published successfully with vector embedding!",
      project: result
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating project"
    });
  }
};

// @desc    Update project (Client owner only)
// @route   PUT /api/projects/:id
// @access  Client only
const updateProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const { title, description, category, budget, budgetType, deadline, status, skillsRequired } = req.body;

    const existing = await query("SELECT * FROM projects WHERE id = $1;", [projectId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (existing.rows[0].client_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to update this project" });
    }

    // Recompute embedding if title, category, description, or skills change
    const embedding = generateProjectEmbedding({
      title: title || existing.rows[0].title,
      category: category || existing.rows[0].category,
      description: description || existing.rows[0].description,
      skills: skillsRequired || []
    });

    const updateSql = `
      UPDATE projects
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          budget = COALESCE($4, budget),
          budget_type = COALESCE($5, budget_type),
          deadline = COALESCE($6, deadline),
          status = COALESCE($7, status),
          embedding = $8::vector
      WHERE id = $9
      RETURNING *;
    `;

    const { rows } = await query(updateSql, [
      title,
      description,
      category,
      budget ? Number(budget) : null,
      budgetType,
      deadline,
      status,
      embedding,
      projectId
    ]);

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: rows[0]
    });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating project"
    });
  }
};

// @desc    Delete project (Client owner only)
// @route   DELETE /api/projects/:id
// @access  Client only
const deleteProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);

    const existing = await query("SELECT client_id FROM projects WHERE id = $1;", [projectId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (existing.rows[0].client_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this project" });
    }

    await query("DELETE FROM projects WHERE id = $1;", [projectId]);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting project"
    });
  }
};

// @desc    Get semantic project recommendations for logged-in freelancer
// @route   GET /api/projects/recommendations
// @access  Freelancer only
const getFreelancerRecommendations = async (req, res) => {
  try {
    const recommendations = await recommendProjectsForFreelancer(req.user.id, 8);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error("Vector recommendation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error calculating vector recommendations"
    });
  }
};

// @desc    Get semantic freelancer recommendations for a project
// @route   GET /api/projects/:id/freelancers
// @access  Client only
const getProjectFreelancers = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const recommendations = await recommendFreelancersForProject(projectId, 8);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error("Vector freelancer recommendation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error calculating freelancer recommendations"
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
  getFreelancerRecommendations,
  getProjectFreelancers
};
