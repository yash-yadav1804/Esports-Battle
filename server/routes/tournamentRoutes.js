const express = require("express");
const {
  createTournament,
  registerTeam,
  getAllTournaments,
  getTournamentById,
} = require("../controllers/tournamentController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/createTournament",
  protect,
  authorizeRoles("admin"),
  createTournament,
);
router.post("/register/:tournamentId", protect, registerTeam);
router.get("/", getAllTournaments);
router.get("/:tournamentId", getTournamentById);

module.exports = router;
