const express = require("express");
const multer = require("multer");
const { storage } = require("../config/cloudinaryConfig");
const { uploadRequirement, extractRequirements, extractRequirementsVersion } = require("../controllers/reqAnalysis");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

const router = express.Router();
// Multer Configuration
const upload = multer({ storage });

// Route to Upload Requirement Document
router.get("/:id", verifyToken, checkProjectAccess, extractRequirements);
router.get("/:id/:version", verifyToken, checkProjectAccess, extractRequirementsVersion);
router.post("/:id", verifyToken, checkProjectAccess, upload.single("file"), uploadRequirement);

module.exports = router;
