const express = require("express");
const {
  createTeam,
  joinTeam,
  getAllTeams,
  getTeamById,
} = require("../controllers/teamController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, createTeam);
router.post("/join/:teamId", protect, joinTeam);
router.get("/", getAllTeams);
router.get("/:teamId", getTeamById);
module.exports = router;
