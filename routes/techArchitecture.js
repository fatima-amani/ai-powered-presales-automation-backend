const express = require("express");
const { generateTechStack, generateArchitectureDiagram } = require("../controllers/techArchitecture");

const router = express.Router();

// Route to generate tech stack recommendation
router.get("/generate-tech-stack/:id", generateTechStack);

// Route to generate architecture diagram
router.get("/generate-architecture-diagram/:id", generateArchitectureDiagram);

module.exports = router;
