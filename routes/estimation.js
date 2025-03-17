const express = require("express");
const router = express.Router();
const { generateEffortEstimation, getEffortEstimationbyVersion } = require("../controllers/estimation");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

router.get("/:id", verifyToken,  checkProjectAccess, generateEffortEstimation);
router.get("/:id/:version", verifyToken,  checkProjectAccess, getEffortEstimationbyVersion);

module.exports = router;
