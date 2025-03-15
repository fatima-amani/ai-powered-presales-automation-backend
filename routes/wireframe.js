const express = require("express");
const { generateWireFrame } = require("../controllers/wireframe");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to generate tech stack recommendation
router.get("/:id", verifyToken, checkProjectAccess, generateWireFrame);

module.exports = router;
