const express = require("express");
const userController = require("../controllers/user");

const router = express.Router();

// Get all users
router.get("/", userController.getAllUsers);

// Get user by ID
router.get("/:id", userController.getUserById);

// Create a new user
router.post("/", userController.createUser);

// Update a user (excluding email, password, and role)
router.put("/:id", userController.updateUser);

// Delete a user by ID
router.delete("/:id", userController.deleteUser);

module.exports = router;