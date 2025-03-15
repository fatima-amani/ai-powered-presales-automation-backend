const express = require("express");
const router = express.Router();
const { generateUserPersona } = require("../controllers/userPersona");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

router.get("/:id", verifyToken, checkProjectAccess, generateUserPersona);

module.exports = router;
