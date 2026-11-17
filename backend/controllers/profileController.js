const { query } = require("../config/db");
const { generateFreelancerEmbedding } = require("../services/vectorService");

// @desc    Get user profile
// @route   GET /api/profiles/user/:id
// @access  Public / Protected
const getUserProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const userRes = await query(
      "SELECT id, name, email, role, avatar_url, bio, created_at FROM users WHERE id = $1;",
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userRes.rows[0];
    let profile = null;
    let skills = [];

    if (user.role === "client") {
      const pRes = await query("SELECT * FROM client_profiles WHERE user_id = $1;", [userId]);
      if (pRes.rows.length > 0) profile = pRes.rows[0];
    } else if (user.role === "freelancer") {
      const pRes = await query("SELECT * FROM freelancer_profiles WHERE user_id = $1;", [userId]);
      if (pRes.rows.length > 0) profile = pRes.rows[0];

      const sRes = await query(
        `SELECT s.id, s.name, s.category, fs.years_of_experience 
         FROM freelancer_skills fs
         JOIN skills s ON fs.skill_id = s.id
         WHERE fs.freelancer_id = $1;`,
        [userId]
      );
      skills = sRes.rows;
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        profile,
        skills
      }
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
};

// @desc    Update user profile & skills
// @route   PUT /api/profiles
// @access  Protected
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      avatarUrl,
      // Client specific
      companyName,
      industry,
      website,
      // Freelancer specific
      title,
      hourlyRate,
      experienceYears,
      portfolioUrl,
      skills = []
    } = req.body;

    // 1. Update basic user info
    await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4;`,
      [name, bio, avatarUrl, req.user.id]
    );

    // 2. Role-specific profile updates
    if (req.user.role === "client") {
      await query(
        `UPDATE client_profiles
         SET company_name = COALESCE($1, company_name),
             industry = COALESCE($2, industry),
             website = COALESCE($3, website)
         WHERE user_id = $4;`,
        [companyName, industry, website, req.user.id]
      );
    } else if (req.user.role === "freelancer") {
      // Recompute embedding for freelancer
      const embedding = generateFreelancerEmbedding({
        title: title || req.user.title || "Freelancer",
        bio: bio || req.user.bio || "",
        experience_years: experienceYears || 1,
        skills
      });

      await query(
        `UPDATE freelancer_profiles
         SET title = COALESCE($1, title),
             hourly_rate = COALESCE($2, hourly_rate),
             experience_years = COALESCE($3, experience_years),
             portfolio_url = COALESCE($4, portfolio_url),
             embedding = $5::vector
         WHERE user_id = $6;`,
        [
          title,
          hourlyRate ? Number(hourlyRate) : null,
          experienceYears ? Number(experienceYears) : null,
          portfolioUrl,
          embedding,
          req.user.id
        ]
      );

      // Update skills if provided
      if (Array.isArray(skills) && skills.length > 0) {
        await query("DELETE FROM freelancer_skills WHERE freelancer_id = $1;", [req.user.id]);
        for (const skillName of skills) {
          const sRes = await query(
            `INSERT INTO skills (name, category)
             VALUES ($1, 'General')
             ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
             RETURNING id;`,
            [skillName.trim()]
          );
          const skillId = sRes.rows[0].id;

          await query(
            `INSERT INTO freelancer_skills (freelancer_id, skill_id, years_of_experience)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING;`,
            [req.user.id, skillId, Number(experienceYears) || 1]
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully! Vector embeddings regenerated."
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating profile"
    });
  }
};

module.exports = {
  getUserProfile,
  updateProfile
};
