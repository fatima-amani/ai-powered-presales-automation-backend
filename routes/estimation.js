const express = require("express");
const router = express.Router();
const { generateEffortEstimation } = require("../controllers/estimation");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

router.get("/:id", verifyToken, checkProjectAccess, generateEffortEstimation);

module.exports = router;
