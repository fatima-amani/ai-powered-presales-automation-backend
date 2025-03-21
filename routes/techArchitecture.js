const express = require("express");
const { generateTechStack, generateArchitectureDiagram, getTechStackByVersion, getArchitectureDiagramByVersion,reGenerateTechStack, reGenerateArchitectureDiagram } = require("../controllers/techArchitecture");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");


const router = express.Router();

// Route to generate tech stack recommendation
router.get("/generate-tech-stack/:id", verifyToken, checkProjectAccess, generateTechStack);
router.get("/re-generate-tech-stack/:id", verifyToken, checkProjectAccess, reGenerateTechStack);
router.get("/generate-tech-stack/:id/:version", verifyToken, checkProjectAccess, getTechStackByVersion);

// Route to generate architecture diagram
router.get("/generate-architecture-diagram/:id", verifyToken,checkProjectAccess, generateArchitectureDiagram);
router.get("/re-generate-architecture-diagram/:id", verifyToken,checkProjectAccess, reGenerateArchitectureDiagram);
router.get("/generate-architecture-diagram/:id/:version", verifyToken, checkProjectAccess, getArchitectureDiagramByVersion);

module.exports = router;
