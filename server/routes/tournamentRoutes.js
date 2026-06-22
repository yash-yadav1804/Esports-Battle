const express = require("express");

const {
  createTournament,
  registerTeam,
  getAllTournaments,
  getTournamentById,
  leaveTournament,
  startTournament,
  completeTournament,
  getTournamentHistory,
} = require("../controllers/tournamentController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/createTournament",
  protect,
  authorizeRoles("admin"),
  createTournament,
);

router.get("/", getAllTournaments);

router.get("/history/completed", getTournamentHistory);

router.post("/register/:tournamentId", protect, registerTeam);

router.post("/leave/:tournamentId", protect, leaveTournament);

router.patch(
  "/start/:tournamentId",
  protect,
  authorizeRoles("admin"),
  startTournament,
);

router.patch(
  "/complete/:tournamentId",
  protect,
  authorizeRoles("admin"),
  completeTournament,
);

router.get("/:tournamentId", getTournamentById);

module.exports = router;
