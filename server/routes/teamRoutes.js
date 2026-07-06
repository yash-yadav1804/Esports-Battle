const express = require("express");

const {
  createTeam,
  joinTeam,
  getAllTeams,
  getTeamById,
  leaveTeam,
  removePlayerFromTeam,
  transferCaptain,
} = require("../controllers/teamController");

const protect = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  createTeamSchema,
  teamIdParamSchema,
  playerIdParamSchema,
  newCaptainIdParamSchema,
} = require("../validators/teamValidator");

const router = express.Router();

router.post("/create", protect, validateRequest(createTeamSchema), createTeam);

router.post(
  "/join/:teamId",
  protect,
  validateRequest(teamIdParamSchema),
  joinTeam,
);

router.patch("/leave", protect, leaveTeam);

router.patch(
  "/remove-player/:playerId",
  protect,
  validateRequest(playerIdParamSchema),
  removePlayerFromTeam,
);

router.patch(
  "/transfer-captain/:newCaptainId",
  protect,
  validateRequest(newCaptainIdParamSchema),
  transferCaptain,
);

router.get("/", getAllTeams);

router.get("/:teamId", validateRequest(teamIdParamSchema), getTeamById);

module.exports = router;
