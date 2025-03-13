const express = require("express");
const router = express.Router();
const { generateEffortEstimation } = require("../controllers/estimation");

router.get("/:id", generateEffortEstimation);

module.exports = router;
