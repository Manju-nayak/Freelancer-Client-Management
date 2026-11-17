const { query } = require("../config/db");
const { recommendProjectsForFreelancer } = require("../services/vectorService");

// @desc    Get Client Dashboard Analytics from real PostgreSQL views
// @route   GET /api/analytics/client
// @access  Client only
const getClientAnalytics = async (req, res) => {
  try {
    const clientId = req.user.id;

    // 1. Client profile spending stats from view_client_spending_stats
    const statsRes = await query(
      "SELECT * FROM view_client_spending_stats WHERE client_id = $1;",
      [clientId]
    );
    const spendingStats = statsRes.rows[0] || {
      total_projects: 0,
      open_projects: 0,
      active_projects: 0,
      completed_projects: 0,
      total_spent: 0
    };

    // 2. Pending proposals count across all client's projects
    const pendingPropRes = await query(
      `SELECT COUNT(*) AS pending_proposals
       FROM proposals pr
       JOIN projects p ON pr.project_id = p.id
       WHERE p.client_id = $1 AND pr.status = 'pending';`,
      [clientId]
    );

    // 3. Pending payments (milestones with status 'approved' but not yet 'paid')
    const pendingPayRes = await query(
      `SELECT COALESCE(SUM(m.amount), 0.00) AS pending_amount
       FROM milestones m
       JOIN projects p ON m.project_id = p.id
       WHERE p.client_id = $1 AND m.status = 'approved';`,
      [clientId]
    );

    // 4. Project summaries from view_project_summaries
    const projectsRes = await query(
      `SELECT * FROM view_project_summaries
       WHERE client_id = $1
       ORDER BY created_at DESC LIMIT 5;`,
      [clientId]
    );

    // 5. Recent notifications / activity
    const activityRes = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 5;`,
      [clientId]
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalProjects: parseInt(spendingStats.total_projects, 10),
        activeProjects: parseInt(spendingStats.active_projects, 10),
        completedProjects: parseInt(spendingStats.completed_projects, 10),
        openProjects: parseInt(spendingStats.open_projects, 10),
        pendingProposals: parseInt(pendingPropRes.rows[0].pending_proposals, 10),
        totalSpent: Number(spendingStats.total_spent),
        pendingPayments: Number(pendingPayRes.rows[0].pending_amount)
      },
      recentProjects: projectsRes.rows,
      recentActivity: activityRes.rows
    });
  } catch (error) {
    console.error("Client analytics error:", error);
    return res.status(500).json({ success: false, message: "Server error calculating client analytics" });
  }
};

// @desc    Get Freelancer Dashboard Analytics from real PostgreSQL views
// @route   GET /api/analytics/freelancer
// @access  Freelancer only
const getFreelancerAnalytics = async (req, res) => {
  try {
    const freelancerId = req.user.id;

    // 1. Performance metrics from view_freelancer_performance
    const perfRes = await query(
      "SELECT * FROM view_freelancer_performance WHERE freelancer_id = $1;",
      [freelancerId]
    );
    const perf = perfRes.rows[0] || {
      active_projects: 0,
      completed_projects: 0,
      total_earnings: 0,
      submitted_proposals: 0,
      accepted_proposals: 0,
      rating_avg: 5.0,
      rating_count: 0,
      completion_rate_pct: 100.0
    };

    // 2. Count total open projects available on platform
    const openRes = await query("SELECT COUNT(*) AS total_available FROM projects WHERE status = 'open';");

    // 3. Vector-based project recommendations (pgvector cosine similarity)
    const recommendations = await recommendProjectsForFreelancer(freelancerId, 4);

    // 4. Active assigned tasks
    const tasksRes = await query(
      `SELECT t.*, p.title AS project_title
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.assigned_to = $1 AND t.status != 'completed'
       ORDER BY t.due_date ASC LIMIT 5;`,
      [freelancerId]
    );

    // 5. Recent notifications
    const notifRes = await query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5;",
      [freelancerId]
    );

    return res.status(200).json({
      success: true,
      stats: {
        availableProjects: parseInt(openRes.rows[0].total_available, 10),
        submittedProposals: parseInt(perf.submitted_proposals, 10),
        acceptedProposals: parseInt(perf.accepted_proposals, 10),
        activeProjects: parseInt(perf.active_projects, 10),
        completedProjects: parseInt(perf.completed_projects, 10),
        totalEarnings: Number(perf.total_earnings),
        averageRating: Number(perf.rating_avg),
        ratingCount: parseInt(perf.rating_count, 10),
        completionRate: Number(perf.completion_rate_pct)
      },
      recommendations,
      activeTasks: tasksRes.rows,
      recentActivity: notifRes.rows
    });
  } catch (error) {
    console.error("Freelancer analytics error:", error);
    return res.status(500).json({ success: false, message: "Server error calculating freelancer analytics" });
  }
};

// @desc    Get Admin Dashboard Analytics from view_platform_analytics
// @route   GET /api/analytics/admin
// @access  Admin only
const getAdminAnalytics = async (req, res) => {
  try {
    const analyticsRes = await query("SELECT * FROM view_platform_analytics;");
    const a = analyticsRes.rows[0];

    // Category distribution query using GROUP BY
    const categoryRes = await query(
      `SELECT category, COUNT(*) AS count, ROUND(AVG(budget)::numeric, 2) AS avg_budget
       FROM projects
       GROUP BY category
       ORDER BY count DESC;`
    );

    // Monthly transaction volume using GROUP BY
    const monthlyTxnRes = await query(
      `SELECT 
         TO_CHAR(created_at, 'Mon YYYY') AS month,
         COUNT(*) AS transaction_count,
         SUM(amount) AS total_amount
       FROM payments
       WHERE status = 'completed'
       GROUP BY TO_CHAR(created_at, 'Mon YYYY')
       ORDER BY MIN(created_at) DESC;`
    );

    // Top rated freelancers query using JOIN and ORDER BY
    const topFreelancers = await query(
      `SELECT freelancer_id, name, title, rating_avg, rating_count, total_earnings, completed_projects
       FROM view_freelancer_performance
       ORDER BY rating_avg DESC, completed_projects DESC
       LIMIT 5;`
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: parseInt(a.total_users, 10),
        totalClients: parseInt(a.total_clients, 10),
        totalFreelancers: parseInt(a.total_freelancers, 10),
        totalProjects: parseInt(a.total_projects, 10),
        openProjects: parseInt(a.open_projects, 10),
        activeProjects: parseInt(a.active_projects, 10),
        completedProjects: parseInt(a.completed_projects, 10),
        totalProposals: parseInt(a.total_proposals, 10),
        totalTransactions: parseInt(a.total_transactions, 10),
        totalVolume: Number(a.total_volume_amount),
        avgProjectBudget: Number(a.avg_project_budget)
      },
      categoryDistribution: categoryRes.rows,
      monthlyTransactions: monthlyTxnRes.rows,
      topFreelancers: topFreelancers.rows
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return res.status(500).json({ success: false, message: "Server error calculating admin analytics" });
  }
};

module.exports = {
  getClientAnalytics,
  getFreelancerAnalytics,
  getAdminAnalytics
};
