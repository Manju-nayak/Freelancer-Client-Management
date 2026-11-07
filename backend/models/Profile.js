
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        headline: {
            type: String,
            trim: true,
            default: ""
        },

        skills: {
            type: [String],
            default: []
        },

        hourlyRate: {
            type: Number,
            min: 0,
            default: 0
        },

        experience: {
            type: String,
            default: ""
        },

        portfolio: {
            type: [String],
            default: []
        },

        location: {
            type: String,
            default: ""
        },

        companyName: {
            type: String,
            default: ""
        },

        website: {
            type: String,
            default: ""
        },

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
