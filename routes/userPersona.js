const express = require("express");
const router = express.Router();
const { generateUserPersona, getUserPersonaByVersion } = require("../controllers/userPersona");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

router.get("/:id", verifyToken, checkProjectAccess, generateUserPersona);
router.get("/:id/:version", verifyToken, checkProjectAccess, getUserPersonaByVersion);

module.exports = router;
