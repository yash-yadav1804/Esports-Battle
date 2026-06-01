const express = require("express");
const { createTeam, joinTeam } = require("../controllers/teamController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/create", protect, createTeam);
router.post("/join/:teamId", protect, joinTeam);
module.exports = router;
