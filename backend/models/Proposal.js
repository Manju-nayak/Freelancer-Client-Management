
const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        coverLetter: {
            type: String,
            required: true,
            trim: true
        },

        proposedBudget: {
            type: Number,
            required: true,
            min: 1
        },

        estimatedDuration: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending"
        }
    },
    { timestamps: true }
);

// A freelancer can submit only one proposal per project.
proposalSchema.index(
    { project: 1, freelancer: 1 },
    { unique: true }
);

module.exports = mongoose.model("Proposal", proposalSchema);
