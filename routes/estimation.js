const express = require("express");
const router = express.Router();
const { generateEffortEstimation } = require("../controllers/estimation");

router.post("/:id", generateEffortEstimation);

module.exports = router;
