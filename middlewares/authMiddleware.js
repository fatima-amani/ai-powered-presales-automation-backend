const jwt = require("jsonwebtoken");
const Project = require("../models/project");
const mongoose = require("mongoose");
// const User = require("../models/User");

require("dotenv").config();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Get token from cookie

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user data in request
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Middleware to check if user has access to a project
const checkProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const isCreator = project.createdBy.equals(
      new mongoose.Types.ObjectId(req.user.id)
    );
    const isAssigned = project.assignedUsers.some((user) =>
      user.equals(new mongoose.Types.ObjectId(req.user.id))
    );

    if (!isCreator && !isAssigned) {
      return res
        .status(403)
        .json({
          error: "Access denied. You are not authorized to view this project.",
        });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { verifyToken, checkProjectAccess };
