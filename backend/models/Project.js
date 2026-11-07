
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        skillsRequired: {
            type: [String],
            required: true,
            validate: {
                validator: (skills) => skills.length > 0,
                message: "At least one skill is required"
            }
        },

        budget: {
            type: Number,
            required: true,
            min: 1
        },

        budgetType: {
            type: String,
            enum: ["fixed", "hourly"],
            default: "fixed"
        },

        deadline: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["open", "in-progress", "completed", "cancelled"],
            default: "open"
        },

        experienceLevel: {
            type: String,
            enum: ["beginner", "intermediate", "expert"],
            default: "intermediate"
        },

        attachments: {
            type: [String],
            default: []
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
