const express = require("express");
const multer = require("multer");
const { storage } = require("../config/cloudinaryConfig");
const { uploadRequirement } = require("../controllers/reqAnalysis");

const router = express.Router();
// Multer Configuration
const upload = multer({ storage });

// Route to Upload Requirement Document
router.post("/", upload.single("file"), uploadRequirement);

module.exports = router;
