const express = require("express");

const {
  createTournament,
  registerTeam,
  getAllTournaments,
  getMyCreatedTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  leaveTournament,
  startTournament,
  completeTournament,
  getTournamentHistory,
} = require("../controllers/tournamentController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  createTournamentSchema,
  updateTournamentSchema,
  tournamentIdParamSchema,
} = require("../validators/tournamentValidator");

const router = express.Router();

router.post(
  "/createTournament",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  validateRequest(createTournamentSchema),
  createTournament,
);

router.get("/", getAllTournaments);

router.get(
  "/my-created",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  getMyCreatedTournaments,
);

router.patch(
  "/manage/:tournamentId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  validateRequest(updateTournamentSchema),
  updateTournament,
);

router.delete(
  "/manage/:tournamentId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  validateRequest(tournamentIdParamSchema),
  deleteTournament,
);

router.get("/history/completed", getTournamentHistory);

router.post(
  "/register/:tournamentId",
  protect,
  validateRequest(tournamentIdParamSchema),
  registerTeam,
);

router.post(
  "/leave/:tournamentId",
  protect,
  validateRequest(tournamentIdParamSchema),
  leaveTournament,
);

router.patch(
  "/start/:tournamentId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  validateRequest(tournamentIdParamSchema),
  startTournament,
);

router.patch(
  "/complete/:tournamentId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  validateRequest(tournamentIdParamSchema),
  completeTournament,
);

router.get(
  "/:tournamentId",
  validateRequest(tournamentIdParamSchema),
  getTournamentById,
);

module.exports = router;
