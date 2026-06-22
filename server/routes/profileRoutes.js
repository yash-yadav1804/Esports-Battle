const express = require("express");

const {
  getMyProfile,
  getMyTeam,
  getMyTournaments,
  getMyMatchHistory,
  updateMyProfile,
} = require("../controllers/profileController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getMyProfile);

router.get("/my-team", protect, getMyTeam);

router.get("/my-tournaments", protect, getMyTournaments);

router.get("/my-match-history", protect, getMyMatchHistory);

router.patch("/update", protect, updateMyProfile);

module.exports = router;
