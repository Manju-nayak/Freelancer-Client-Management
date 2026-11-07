const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

const { authorizeRoles } = require("../middleware/authMiddleware");

router.get(
    "/client-test",
    protect,
    authorizeRoles("client"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Client access granted!",
            user: req.user.name,
            role: req.user.role
        });
    }
);

router.get(
    "/freelancer-test",
    protect,
    authorizeRoles("freelancer"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Freelancer access granted!",
            user: req.user.name,
            role: req.user.role
        });
    }
);

router.get(
    "/admin-test",
    protect,
    authorizeRoles("admin"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin access granted!",
            user: req.user.name,
            role: req.user.role
        });
    }
);

module.exports = router;