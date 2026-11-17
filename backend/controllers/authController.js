const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query, transaction } = require("../config/db");
const { JWT_SECRET } = require("../middleware/authMiddleware");
const { generateFreelancerEmbedding } = require("../services/vectorService");

/**
 * Generate JWT Token helper
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "30d"
  });
};

// @desc    Register a new user (Client, Freelancer, or Admin)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName, industry, title, hourlyRate } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password, and role."
      });
    }

    if (!["client", "freelancer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'client', 'freelancer', or 'admin'."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }

    // Check if user already exists
    const existing = await query("SELECT id FROM users WHERE email = $1;", [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists."
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Atomic transaction to create user and profile
    const result = await transaction(async (txQuery) => {
      const userRes = await txQuery(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, avatar_url, bio, is_active, created_at;`,
        [name.trim(), email.toLowerCase().trim(), passwordHash, role]
      );
      const user = userRes.rows[0];

      if (role === "client") {
        await txQuery(
          `INSERT INTO client_profiles (user_id, company_name, industry)
           VALUES ($1, $2, $3);`,
          [user.id, companyName || "", industry || ""]
        );
      } else if (role === "freelancer") {
        const defaultProfile = {
          title: title || "Freelance Professional",
          skills: [],
          experience_years: 1,
          bio: ""
        };
        const embedding = generateFreelancerEmbedding(defaultProfile);

        await txQuery(
          `INSERT INTO freelancer_profiles (user_id, title, hourly_rate, embedding)
           VALUES ($1, $2, $3, $4::vector);`,
          [user.id, title || "Freelance Professional", Number(hourlyRate) || 0.0, embedding]
        );
      }

      return user;
    });

    const token = generateToken(result.id, result.role);

    return res.status(201).json({
      success: true,
      message: "Account registered successfully!",
      token,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        avatarUrl: result.avatar_url,
        bio: result.bio
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error occurred during registration."
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password."
      });
    }

    const { rows } = await query(
      "SELECT id, name, email, password_hash, role, avatar_url, bio, is_active FROM users WHERE email = $1;",
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = generateToken(user.id, user.role);

    // Fetch profile data based on role
    let profile = null;
    if (user.role === "client") {
      const pRes = await query("SELECT * FROM client_profiles WHERE user_id = $1;", [user.id]);
      if (pRes.rows.length > 0) profile = pRes.rows[0];
    } else if (user.role === "freelancer") {
      const pRes = await query("SELECT * FROM freelancer_profiles WHERE user_id = $1;", [user.id]);
      if (pRes.rows.length > 0) profile = pRes.rows[0];
    }

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        profile
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during login."
    });
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res) => {
  try {
    let profile = null;
    let skills = [];

    if (req.user.role === "client") {
      const pRes = await query("SELECT * FROM client_profiles WHERE user_id = $1;", [req.user.id]);
      if (pRes.rows.length > 0) profile = pRes.rows[0];
    } else if (req.user.role === "freelancer") {
      const pRes = await query("SELECT * FROM freelancer_profiles WHERE user_id = $1;", [req.user.id]);
      if (pRes.rows.length > 0) profile = pRes.rows[0];

      const sRes = await query(
        `SELECT s.id, s.name, s.category, fs.years_of_experience 
         FROM freelancer_skills fs
         JOIN skills s ON fs.skill_id = s.id
         WHERE fs.freelancer_id = $1;`,
        [req.user.id]
      );
      skills = sRes.rows;
    }

    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatarUrl: req.user.avatar_url,
        bio: req.user.bio,
        profile,
        skills
      }
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
