const express = require("express");
const router = express.Router();
const {
  getClientPayments,
  getFreelancerEarnings,
  createPayment
} = require("../controllers/paymentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/client", protect, authorizeRoles("client", "admin"), getClientPayments);
router.get("/freelancer", protect, authorizeRoles("freelancer", "admin"), getFreelancerEarnings);
router.post("/", protect, authorizeRoles("client", "admin"), createPayment);

module.exports = router;
