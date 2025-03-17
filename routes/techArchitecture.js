const express = require("express");
const { generateTechStack, generateArchitectureDiagram, getTechStackByVersion, getArchitectureDiagramByVersion } = require("../controllers/techArchitecture");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");


const router = express.Router();

// Route to generate tech stack recommendation
router.get("/generate-tech-stack/:id", verifyToken, checkProjectAccess, generateTechStack);
router.get("/generate-tech-stack/:id/:version", verifyToken, checkProjectAccess, getTechStackByVersion);

// Route to generate architecture diagram
router.get("/generate-architecture-diagram/:id", verifyToken,checkProjectAccess, generateArchitectureDiagram);
router.get("/generate-architecture-diagram/:id/:version", verifyToken, checkProjectAccess, getArchitectureDiagramByVersion);

module.exports = router;
