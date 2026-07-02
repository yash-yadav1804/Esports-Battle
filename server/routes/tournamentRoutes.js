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
  getMyCreatedTournaments,
} = require("../controllers/tournamentController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/createTournament",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  createTournament,
);

router.get("/", getAllTournaments);

router.get(
  "/my-created",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  getMyCreatedTournaments,
);

router.get("/history/completed", getTournamentHistory);

router.post("/register/:tournamentId", protect, registerTeam);

router.post("/leave/:tournamentId", protect, leaveTournament);

router.patch(
  "/start/:tournamentId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  startTournament,
);

router.patch(
  "/complete/:tournamentId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  completeTournament,
);

router.get("/:tournamentId", getTournamentById);

module.exports = router;
