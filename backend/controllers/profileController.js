
const Profile = require("../models/Profile");

// @desc    Get logged-in user's profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user._id })
            .populate("user", "name email role profileImage bio");

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found. Please create your profile."
            });
        }

        return res.status(200).json({
            success: true,
            profile
        });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Create or update logged-in user's profile
// @route   PUT /api/profiles/me
// @access  Private
const updateMyProfile = async (req, res) => {
    try {
        const {
            headline,
            skills,
            hourlyRate,
            experience,
            portfolio,
            location,
            companyName,
            website,
            isAvailable
        } = req.body;

        const profileData = {};

        if (headline !== undefined) profileData.headline = headline;
        if (skills !== undefined) profileData.skills = skills;
        if (hourlyRate !== undefined) profileData.hourlyRate = hourlyRate;
        if (experience !== undefined) profileData.experience = experience;
        if (portfolio !== undefined) profileData.portfolio = portfolio;
        if (location !== undefined) profileData.location = location;
        if (companyName !== undefined) profileData.companyName = companyName;
        if (website !== undefined) profileData.website = website;
        if (isAvailable !== undefined) profileData.isAvailable = isAvailable;

        if (
            req.user.role !== "freelancer" &&
            (hourlyRate !== undefined || skills !== undefined ||
             experience !== undefined || portfolio !== undefined ||
             isAvailable !== undefined)
        ) {
            return res.status(403).json({
                success: false,
                message: "These fields are only available for freelancers"
            });
        }

        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileData },
                { new: true, runValidators: true }
            );
        } else {
            profile = await Profile.create({
                user: req.user._id,
                ...profileData
            });
        }

        profile = await profile.populate(
            "user",
            "name email role profileImage bio"
        );

        return res.status(200).json({
            success: true,
            message: "Profile saved successfully",
            profile
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile
};
