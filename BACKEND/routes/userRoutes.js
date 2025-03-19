const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// Admin-only routes
router.get("/", authController.protect, authController.restrictTo("admin"), userController.getAllUsers);
router.put("/:id", authController.protect, authController.restrictTo("admin"), userController.updateUser);
router.delete("/:id", authController.protect, authController.restrictTo("admin"), userController.deleteUser);

router.get("/:id", authController.protect, userController.getUserById);


module.exports = router;