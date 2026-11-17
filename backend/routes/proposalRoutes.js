const express = require("express");
const router = express.Router();
const {
  submitProposal,
  getMyProposals,
  getProjectProposals,
  updateProposalStatus
} = require("../controllers/proposalController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Submit proposal - Freelancer only
router.post("/", protect, authorizeRoles("freelancer"), submitProposal);

// Get my proposals - Freelancer only
router.get("/my-proposals", protect, authorizeRoles("freelancer"), getMyProposals);

// Get proposals for client project
router.get("/project/:projectId", protect, authorizeRoles("client", "admin"), getProjectProposals);

// Accept or reject proposal (triggers ACID transaction)
router.patch("/:id/status", protect, authorizeRoles("client", "admin"), updateProposalStatus);

module.exports = router;
