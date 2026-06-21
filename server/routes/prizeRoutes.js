const express = require("express");

const { generatePrizes, getPrizes } = require("../controllers/prizeController");

const router = express.Router();

router.post("/generate/:tournamentId", generatePrizes);

router.get("/:tournamentId", getPrizes);

module.exports = router;
