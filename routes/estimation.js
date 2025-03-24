const express = require("express");
const router = express.Router();
const { generateEffortEstimation, reGenerateEffortEstimation,getEffortEstimationbyVersion } = require("../controllers/estimation");
const { verifyToken, checkProjectAccess } = require("../middlewares/authMiddleware");

router.get("/regenerate/:id", verifyToken,  checkProjectAccess, reGenerateEffortEstimation);
router.get("/:id", verifyToken,  checkProjectAccess, generateEffortEstimation);
router.get("/:id/:version", verifyToken,  checkProjectAccess, getEffortEstimationbyVersion);

module.exports = router;
