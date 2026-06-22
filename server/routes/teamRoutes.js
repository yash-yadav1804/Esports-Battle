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

const router = express.Router();
router.post("/create", protect, createTeam);
router.post("/join/:teamId", protect, joinTeam);
router.patch("/leave", protect, leaveTeam);
router.patch("/remove-player/:playerId", protect, removePlayerFromTeam);
router.patch("/transfer-captain/:newCaptainId", protect, transferCaptain);
router.get("/", getAllTeams);
router.get("/:teamId", getTeamById);
module.exports = router;
