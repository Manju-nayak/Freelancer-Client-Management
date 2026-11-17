const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { getDB, query, getDatabaseStatus } = require("./config/db");
const seed = require("./database/seed");

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const projectRoutes = require("./routes/projectRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const taskRoutes = require("./routes/taskRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    platform: "Freelancer-Client Project Management System (DBMS Level 3)",
    database: getDatabaseStatus(),
    version: "2.0.0"
  });
});

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    const dbTest = await query("SELECT 1 AS status;");
    const dbStatus = getDatabaseStatus();

    res.status(200).json({
      success: true,
      message: "FreelanceHub PostgreSQL + pgvector Backend Server is fully operational!",
      database: {
        ...dbStatus,
        connected: dbTest.rows.length > 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Database connection check failed",
      error: err.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await getDB();
    
    // Auto-seed if database is empty
    const checkUsers = await query("SELECT COUNT(*) AS total FROM users;");
    if (parseInt(checkUsers.rows[0].total, 10) === 0) {
      console.log("Empty database detected. Running automatic initial seed...");
      await seed();
    }

    app.listen(PORT, () => {
      console.log(`================================================================`);
      console.log(` FreelanceHub Backend Server running on port ${PORT}`);
      console.log(` Database: PostgreSQL + pgvector (Semantic Matching Active)`);
      console.log(` API Health: http://localhost:${PORT}/api/health`);
      console.log(`================================================================`);
    });
  } catch (error) {
    console.error("Failed to start FreelanceHub server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
