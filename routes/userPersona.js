const express = require("express");
const router = express.Router();
const { generateUserPersona, reGenerateUserPersona, getUserPersonaByVersion } = require("../controllers/userPersona");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

router.get("/regenerate/:id", verifyToken,  checkProjectAccess, reGenerateUserPersona);
router.get("/:id", verifyToken, checkProjectAccess, generateUserPersona);
router.get("/:id/:version", verifyToken, checkProjectAccess, getUserPersonaByVersion);

module.exports = router;
