const express = require("express");
const multer = require("multer");
const { storage } = require("../config/cloudinaryConfig");
const { uploadRequirement, extractRequirements } = require("../controllers/reqAnalysis");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

const router = express.Router();
// Multer Configuration
const upload = multer({ storage });

// Route to Upload Requirement Document
router.get("/:id", verifyToken, checkProjectAccess, extractRequirements);
router.post("/:id", verifyToken, checkProjectAccess, upload.single("file"), uploadRequirement);

module.exports = router;
