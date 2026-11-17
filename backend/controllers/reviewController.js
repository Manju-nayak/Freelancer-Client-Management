const { query } = require("../config/db");

// @desc    Submit a review and rating for a completed project
// @route   POST /api/reviews
// @access  Protected
const createReview = async (req, res) => {
  try {
    const { projectId, revieweeId, rating, comment } = req.body;

    if (!projectId || !revieweeId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Project ID, Reviewee ID, rating (1-5), and feedback comment are required."
      });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5."
      });
    }

    // Check project exists
    const projRes = await query("SELECT client_id, assigned_freelancer_id FROM projects WHERE id = $1;", [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = projRes.rows[0];
    const isParticipant = project.client_id === req.user.id || project.assigned_freelancer_id === req.user.id;
    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only project participants can leave reviews."
      });
    }

    // Check duplicate review
    const dupRes = await query(
      "SELECT id FROM reviews WHERE project_id = $1 AND reviewer_id = $2 AND reviewee_id = $3;",
      [projectId, req.user.id, revieweeId]
    );
    if (dupRes.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a review for this user on this project."
      });
    }

    // Insert review (PostgreSQL trigger trg_review_update_rating will auto-recalculate rating_avg!)
    const insertSql = `
      INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows } = await query(insertSql, [
      projectId,
      req.user.id,
      revieweeId,
      numRating,
      comment.trim()
    ]);

    // Send notification to reviewee
    await query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, 'New Review Received', $2, 'review', '/freelancer/reviews');`,
      [
        revieweeId,
        `${req.user.name} rated you ${numRating} stars: "${comment.slice(0, 80)}${comment.length > 80 ? '...' : ''}"`
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully! Rating updated via database trigger.",
      review: rows[0]
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error submitting review"
    });
  }
};

// @desc    Get reviews for a freelancer
// @route   GET /api/reviews/freelancer/:id
// @access  Public / Protected
const getFreelancerReviews = async (req, res) => {
  try {
    const freelancerId = parseInt(req.params.id, 10);
    const sql = `
      SELECT 
        r.*,
        u_rev.name AS reviewer_name,
        u_rev.avatar_url AS reviewer_avatar,
        p.title AS project_title
      FROM reviews r
      JOIN users u_rev ON r.reviewer_id = u_rev.id
      JOIN projects p ON r.project_id = p.id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC;
    `;
    const { rows } = await query(sql, [freelancerId]);

    const avgRating = rows.length > 0
      ? (rows.reduce((sum, r) => sum + r.rating, 0) / rows.length).toFixed(1)
      : "5.0";

    return res.status(200).json({
      success: true,
      count: rows.length,
      averageRating: Number(avgRating),
      reviews: rows
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching reviews" });
  }
};

// @desc    Get reviews for logged-in user
// @route   GET /api/reviews/my-reviews
// @access  Protected
const getMyReviews = async (req, res) => {
  try {
    const receivedSql = `
      SELECT 
        r.*,
        u.name AS reviewer_name,
        p.title AS project_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN projects p ON r.project_id = p.id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC;
    `;
    const givenSql = `
      SELECT 
        r.*,
        u.name AS reviewee_name,
        p.title AS project_title
      FROM reviews r
      JOIN users u ON r.reviewee_id = u.id
      JOIN projects p ON r.project_id = p.id
      WHERE r.reviewer_id = $1
      ORDER BY r.created_at DESC;
    `;

    const [receivedRes, givenRes] = await Promise.all([
      query(receivedSql, [req.user.id]),
      query(givenSql, [req.user.id])
    ]);

    return res.status(200).json({
      success: true,
      received: receivedRes.rows,
      given: givenRes.rows
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching reviews" });
  }
};

module.exports = {
  createReview,
  getFreelancerReviews,
  getMyReviews
};
