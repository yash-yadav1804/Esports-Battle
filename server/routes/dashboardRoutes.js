const express = require("express");
const {
  getTournamentDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/:tournamentId", getTournamentDashboard);

module.exports = router;
