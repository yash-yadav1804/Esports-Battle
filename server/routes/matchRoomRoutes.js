const express = require("express");
const { createMatchRoom } = require("../controllers/matchRoomController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/create/:tournamentId",
  protect,
  authorizeRoles("admin"),
  createMatchRoom,
);

module.exports = router;
