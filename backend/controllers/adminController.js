const { query, getDatabaseStatus } = require("../config/db");

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Admin only
const getAllUsers = async (req, res) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (role && role !== "All") {
      conditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (search && search.trim()) {
      conditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT id, name, email, role, avatar_url, bio, is_active, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    params.push(Number(limit), Number(offset));

    const { rows } = await query(sql, params);
    const countRes = await query(`SELECT COUNT(*) AS total FROM users ${whereClause};`, params.slice(0, paramIndex - 1));

    return res.status(200).json({
      success: true,
      total: parseInt(countRes.rows[0].total, 10),
      users: rows
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching users" });
  }
};

// @desc    Toggle user active status (Admin only)
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Admin only
const toggleUserStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const userRes = await query("SELECT is_active, role FROM users WHERE id = $1;", [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (userRes.rows[0].role === "admin" && userId === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot deactivate your own administrator account." });
    }

    const newStatus = !userRes.rows[0].is_active;
    const { rows } = await query(
      "UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, is_active;",
      [newStatus, userId]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, details)
       VALUES ('user', $1, 'STATUS_TOGGLED', $2);`,
      [userId, `User account ${newStatus ? 'activated' : 'deactivated'} by Admin #${req.user.id}`]
    );

    return res.status(200).json({
      success: true,
      message: `User successfully ${newStatus ? 'activated' : 'deactivated'}`,
      user: rows[0]
    });
  } catch (error) {
    console.error("Admin toggle status error:", error);
    return res.status(500).json({ success: false, message: "Server error updating user status" });
  }
};

// @desc    Get all platform transactions (Admin only)
// @route   GET /api/admin/transactions
// @access  Admin only
const getAllTransactions = async (req, res) => {
  try {
    const sql = `
      SELECT * FROM view_payment_summaries
      ORDER BY created_at DESC;
    `;
    const { rows } = await query(sql);

    const totalVolume = rows
      .filter(t => t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return res.status(200).json({
      success: true,
      count: rows.length,
      totalVolume,
      transactions: rows
    });
  } catch (error) {
    console.error("Admin transactions error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching transactions" });
  }
};

// @desc    Get system audit logs (Admin only)
// @route   GET /api/admin/audit-logs
// @access  Admin only
const getAuditLogs = async (req, res) => {
  try {
    const sql = `
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100;
    `;
    const { rows } = await query(sql);

    return res.status(200).json({
      success: true,
      count: rows.length,
      logs: rows
    });
  } catch (error) {
    console.error("Admin audit logs error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching audit logs" });
  }
};

// @desc    DBMS Demonstration & Live Query Runner (Admin only)
// @route   POST /api/admin/db-query-demo
// @access  Admin only
const executeDemoQuery = async (req, res) => {
  try {
    const { queryType, customSql } = req.body;

    const PRESET_QUERIES = {
      // 1. Multi-Table JOIN with Aggregation & HAVING
      "multi_table_join": {
        name: "Multi-Table JOIN with Grouping & Aggregates",
        sql: `
          SELECT 
            p.id AS project_id,
            p.title,
            p.category,
            p.budget,
            u_client.name AS client_name,
            COALESCE(u_free.name, 'Unassigned') AS freelancer_name,
            COUNT(DISTINCT pr.id) AS proposal_count,
            COUNT(DISTINCT t.id) AS total_tasks,
            COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
            COALESCE(SUM(pay.amount), 0.00) AS total_paid
          FROM projects p
          JOIN users u_client ON p.client_id = u_client.id
          LEFT JOIN users u_free ON p.assigned_freelancer_id = u_free.id
          LEFT JOIN proposals pr ON p.id = pr.project_id
          LEFT JOIN tasks t ON p.id = t.project_id
          LEFT JOIN payments pay ON p.id = pay.project_id AND pay.status = 'completed'
          GROUP BY p.id, p.title, p.category, p.budget, u_client.name, u_free.name
          ORDER BY p.budget DESC;
        `
      },

      // 2. Subquery with Aggregate Filter
      "subquery_aggregation": {
        name: "Nested Subquery & Client Spending Comparison",
        sql: `
          SELECT 
            u.id,
            u.name,
            u.email,
            cp.company_name,
            cp.total_spent,
            (SELECT ROUND(AVG(total_spent)::numeric, 2) FROM client_profiles) AS platform_avg_spent,
            CASE 
              WHEN cp.total_spent > (SELECT AVG(total_spent) FROM client_profiles) THEN 'Above Average'
              ELSE 'Below Average'
            END AS spending_tier
          FROM users u
          JOIN client_profiles cp ON u.id = cp.user_id
          ORDER BY cp.total_spent DESC;
        `
      },

      // 3. PostgreSQL Views Inspection
      "view_inspection": {
        name: "PostgreSQL View: Freelancer Performance Metrics",
        sql: `SELECT * FROM view_freelancer_performance ORDER BY rating_avg DESC, total_earnings DESC;`
      },

      // 4. PostgreSQL GIN Full-Text Search
      "full_text_search": {
        name: "PostgreSQL GIN Full-Text Search with ts_rank",
        sql: `
          SELECT 
            id, 
            title, 
            category, 
            budget,
            ts_rank(search_vector, plainto_tsquery('english', 'analytics engineering design')) AS relevance_rank
          FROM projects
          WHERE search_vector @@ plainto_tsquery('english', 'analytics engineering design')
          ORDER BY relevance_rank DESC;
        `
      },

      // 5. pgvector Cosine Distance Recommendation
      "vector_similarity": {
        name: "pgvector Cosine Distance (<=>) Semantic Matching",
        sql: `
          SELECT 
            p.id AS project_id,
            p.title AS project_title,
            u.name AS freelancer_name,
            fp.title AS freelancer_specialization,
            ROUND((GREATEST(0.0, (1.0 - (p.embedding <=> fp.embedding))) * 100)::numeric, 1) AS match_score_pct,
            ROUND((p.embedding <=> fp.embedding)::numeric, 4) AS cosine_distance
          FROM projects p
          CROSS JOIN freelancer_profiles fp
          JOIN users u ON fp.user_id = u.id
          WHERE p.status = 'open' AND p.embedding IS NOT NULL AND fp.embedding IS NOT NULL
          ORDER BY p.embedding <=> fp.embedding ASC
          LIMIT 6;
        `
      }
    };

    let sqlToRun = PRESET_QUERIES[queryType]?.sql;
    let queryTitle = PRESET_QUERIES[queryType]?.name || "Custom DBMS Query";

    if (customSql && customSql.trim()) {
      // Disallow dangerous destructive statements
      const upper = customSql.toUpperCase();
      if (upper.includes("DROP DATABASE") || upper.includes("TRUNCATE")) {
        return res.status(400).json({ success: false, message: "Destructive operations are restricted in demo runner." });
      }
      sqlToRun = customSql;
      queryTitle = "Custom SQL Execution";
    }

    if (!sqlToRun) {
      return res.status(400).json({ success: false, message: "Invalid query selection." });
    }

    const startTime = process.hrtime();
    const result = await query(sqlToRun);
    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    return res.status(200).json({
      success: true,
      title: queryTitle,
      sql: sqlToRun.trim(),
      executionTimeMs: `${executionTimeMs} ms`,
      rowCount: result.rowCount,
      columns: result.rows.length > 0 ? Object.keys(result.rows[0]) : [],
      data: result.rows,
      dbStatus: getDatabaseStatus()
    });
  } catch (error) {
    console.error("Demo query runner error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "SQL Execution error"
    });
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  getAllTransactions,
  getAuditLogs,
  executeDemoQuery
};
