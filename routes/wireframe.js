const express = require("express");
const { generateWireFrame } = require("../controllers/wireframe");

const router = express.Router();

// Route to generate tech stack recommendation
router.get("/:id", generateWireFrame);

module.exports = router;
