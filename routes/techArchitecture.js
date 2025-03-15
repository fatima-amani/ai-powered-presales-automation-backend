const express = require("express");
const { generateTechStack, generateArchitectureDiagram } = require("../controllers/techArchitecture");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");


const router = express.Router();

// Route to generate tech stack recommendation
router.get("/generate-tech-stack/:id", verifyToken, checkProjectAccess, generateTechStack);

// Route to generate architecture diagram
router.get("/generate-architecture-diagram/:id", verifyToken,checkProjectAccess, generateArchitectureDiagram);

module.exports = router;
