const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  toggleUserStatus,
  getAllTransactions,
  getAuditLogs,
  executeDemoQuery
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// All admin routes protected and restricted to role === 'admin'
router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.get("/transactions", getAllTransactions);
router.get("/audit-logs", getAuditLogs);
router.post("/db-query-demo", executeDemoQuery);

module.exports = router;
