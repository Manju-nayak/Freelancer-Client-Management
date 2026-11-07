
const express = require("express");
const router = express.Router();

const {
    submitProposal,
    getMyProposals,
    getProjectProposals,
    updateProposalStatus
} = require("../controllers/proposalController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Freelancer submits a proposal
router.post(
    "/",
    protect,
    authorizeRoles("freelancer"),
    submitProposal
);

// Freelancer views their proposals
router.get(
    "/my-proposals",
    protect,
    authorizeRoles("freelancer"),
    getMyProposals
);

// Client views proposals for their project
router.get(
    "/project/:projectId",
    protect,
    authorizeRoles("client"),
    getProjectProposals
);

// Client accepts or rejects a proposal
router.patch(
    "/:id/status",
    protect,
    authorizeRoles("client"),
    updateProposalStatus
);

module.exports = router;
