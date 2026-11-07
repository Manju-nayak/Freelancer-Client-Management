
const Task = require("../models/Task");
const Project = require("../models/Project");
const Proposal = require("../models/Proposal");

// @desc    Create and assign a task to the hired freelancer
// @route   POST /api/tasks
// @access  Project owner (client) only
const createTask = async (req, res) => {
    try {
        const {
            projectId,
            assignedTo,
            title,
            description,
            deadline,
            priority
        } = req.body;

        if (!projectId || !assignedTo || !title || !deadline) {
            return res.status(400).json({
                success: false,
                message: "Please provide project, freelancer, title and deadline"
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only create tasks for your own projects"
            });
        }

        if (project.status !== "in-progress") {
            return res.status(400).json({
                success: false,
                message: "Tasks can only be created for projects that are in progress"
            });
        }

        const acceptedProposal = await Proposal.findOne({
            project: projectId,
            freelancer: assignedTo,
            status: "accepted"
        });

        if (!acceptedProposal) {
            return res.status(400).json({
                success: false,
                message: "You can only assign tasks to the freelancer whose proposal was accepted"
            });
        }

        if (new Date(deadline) <= new Date() ||
            Number.isNaN(new Date(deadline).getTime())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid future deadline"
            });
        }

        const task = await Task.create({
            project: projectId,
            assignedTo,
            title,
            description,
            deadline,
            priority
        });

        return res.status(201).json({
            success: true,
            message: "Task created and assigned successfully",
            task
        });
    } catch (error) {
        console.error("Create task error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Get tasks assigned to logged-in freelancer
// @route   GET /api/tasks/my-tasks
// @access  Freelancer only
const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            assignedTo: req.user._id
        })
            .populate("project", "title budget status")
            .sort({ deadline: 1 });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        console.error("Get tasks error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Assigned freelancer only
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["pending", "in-progress", "completed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task status"
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only update tasks assigned to you"
            });
        }

        task.status = status;
        task.completedAt = status === "completed" ? new Date() : null;

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task status updated successfully",
            task
        });
    } catch (error) {
        console.error("Update task status error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Get tasks for a project owned by logged-in client
// @route   GET /api/tasks/project/:projectId
// @access  Client only
const getProjectTasks = async (req, res) => {
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
                message: "You can only view tasks for your own projects"
            });
        }

        const tasks = await Task.find({ project: project._id })
            .populate("assignedTo", "name email")
            .sort({ deadline: 1 });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        console.error("Get project tasks error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    createTask,
    getMyTasks,
    updateTaskStatus,
    getProjectTasks
};
