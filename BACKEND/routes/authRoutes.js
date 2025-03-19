const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Register a new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Get current user details (protected route)
router.get("/me", authController.protect, authController.getMe);

module.exports = router;
