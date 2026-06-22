const express = require("express");
const {
  createTournament,
  registerTeam,
  getAllTournaments,
  getTournamentById,
  leaveTournament,
  startTournament,
  completeTournament,
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
router.post("/leave/:tournamentId", protect, leaveTournament);
router.post("/register/:tournamentId", protect, registerTeam);
router.get("/", getAllTournaments);
router.get("/:tournamentId", getTournamentById);
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

module.exports = router;
