const express = require("express");
const { generateWireFrame, getWireFrameByVersion } = require("../controllers/wireframe");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to generate tech stack recommendation
router.get("/:id", verifyToken, checkProjectAccess, generateWireFrame);
router.get("/:id/:version", verifyToken, checkProjectAccess, getWireFrameByVersion);

module.exports = router;
