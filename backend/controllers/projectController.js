
const Project = require("../models/Project");

// @desc Create a new project
// @route POST /api/projects
// @access Client only
const createProject = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            skillsRequired,
            budget,
            budgetType,
            deadline,
            experienceLevel,
            attachments
        } = req.body;

        if (
            !title || !description || !category ||
            !Array.isArray(skillsRequired) || skillsRequired.length === 0 ||
            budget === undefined || !deadline
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required project details"
            });
        }

        if (Number(budget) <= 0 || !Number.isFinite(Number(budget))) {
            return res.status(400).json({
                success: false,
                message: "Budget must be a positive number"
            });
        }

        if (
            new Date(deadline) <= new Date() ||
            Number.isNaN(new Date(deadline).getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid future deadline"
            });
        }

        const project = await Project.create({
            client: req.user._id,
            title,
            description,
            category,
            skillsRequired,
            budget: Number(budget),
            budgetType,
            deadline,
            experienceLevel,
            attachments
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            project
        });
    } catch (error) {
        console.error("Create project error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc Get all open projects
// @route GET /api/projects
// @access Logged-in users
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: "open" })
            .populate("client", "name email profileImage")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        console.error("Get projects error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc Get projects posted by logged-in client
// @route GET /api/projects/my-projects
// @access Client only
const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ client: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        console.error("Get my projects error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc Get a single project
// @route GET /api/projects/:id
// @access Logged-in users
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("client", "name email profileImage");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        console.error("Get project error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc Update a project
// @route PUT /api/projects/:id
// @access Project owner only
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own projects"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "category",
            "skillsRequired",
            "budget",
            "budgetType",
            "deadline",
            "experienceLevel",
            "attachments",
            "status"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                project[field] = req.body[field];
            }
        });

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project
        });
    } catch (error) {
        console.error("Update project error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc Delete a project
// @route DELETE /api/projects/:id
// @access Project owner only
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own projects"
            });
        }

        await project.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (error) {
        console.error("Delete project error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getMyProjects,
    getProjectById,
    updateProject,
    deleteProject
};
