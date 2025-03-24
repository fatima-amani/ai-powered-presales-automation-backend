const User = require("../models/User");
const bcrypt = require("bcrypt");

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password from the response
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id, { password: 0 }); // Exclude password from the response
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new user
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required fields." });
    }

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "junior", // Default role is 'junior'
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Exclude password from the response
        const { password: _, ...userWithoutPassword } = savedUser.toObject();
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a user (excluding email, password, and role)
const updateUser = async (req, res) => {
    const { name } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, updatedAt: Date.now() }, // Only allow updating name and updatedAt
            { new: true, select: { password: 0 } } // Exclude password from the response
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};