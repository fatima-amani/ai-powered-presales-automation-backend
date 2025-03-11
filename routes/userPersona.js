const express = require("express");
const router = express.Router();
const { generateUserPersona } = require("../controllers/userPersona");

router.get("/:id", generateUserPersona);

module.exports = router;
