
const Proposal = require("../models/Proposal");
const Project = require("../models/Project");

// @desc    Submit a proposal for a project
// @route   POST /api/proposals
// @access  Freelancer only
const submitProposal = async (req, res) => {
    try {
        const {
            projectId,
            coverLetter,
            proposedBudget,
            estimatedDuration
        } = req.body;

        if (!projectId || !coverLetter || !proposedBudget || !estimatedDuration) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required proposal details"
            });
        }

        if (!Number.isFinite(Number(proposedBudget)) || Number(proposedBudget) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Proposed budget must be a positive number"
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (project.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "This project is no longer accepting proposals"
            });
        }

        if (project.client.toString() === req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You cannot submit a proposal to your own project"
            });
        }

        const existingProposal = await Proposal.findOne({
            project: projectId,
            freelancer: req.user._id
        });

        if (existingProposal) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted a proposal for this project"
            });
        }

        const proposal = await Proposal.create({
            project: projectId,
            freelancer: req.user._id,
            coverLetter,
            proposedBudget: Number(proposedBudget),
            estimatedDuration
        });

        return res.status(201).json({
            success: true,
            message: "Proposal submitted successfully",
            proposal
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted a proposal for this project"
            });
        }

        console.error("Submit proposal error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Get proposals submitted by logged-in freelancer
// @route   GET /api/proposals/my-proposals
// @access  Freelancer only
const getMyProposals = async (req, res) => {
    try {
        const proposals = await Proposal.find({
            freelancer: req.user._id
        })
            .populate("project", "title budget budgetType deadline status")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: proposals.length,
            proposals
        });
    } catch (error) {
        console.error("Get my proposals error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Get proposals for a project owned by logged-in client
// @route   GET /api/proposals/project/:projectId
// @access  Client only
const getProjectProposals = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only view proposals for your own projects"
            });
        }

        const proposals = await Proposal.find({
            project: project._id
        })
            .populate("freelancer", "name email profileImage bio")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: proposals.length,
            proposals
        });
    } catch (error) {
        console.error("Get project proposals error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Accept or reject a proposal
// @route   PATCH /api/proposals/:id/status
// @access  Project owner (client) only
const updateProposalStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be accepted or rejected"
            });
        }

        const proposal = await Proposal.findById(req.params.id)
            .populate("project");

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        if (proposal.project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only manage proposals for your own projects"
            });
        }

        if (proposal.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This proposal has already been processed"
            });
        }

        proposal.status = status;
        await proposal.save();

        return res.status(200).json({
            success: true,
            message: `Proposal ${status} successfully`,
            proposal
        });
    } catch (error) {
        console.error("Update proposal status error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    submitProposal,
    getMyProposals,
    getProjectProposals,
    updateProposalStatus
};
