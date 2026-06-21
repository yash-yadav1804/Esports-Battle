const express = require("express");
const { getWinner } = require("../controllers/winnerController");

const router = express.Router();

router.get("/:tournamentId", getWinner);

module.exports = router;
