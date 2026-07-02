const express = require("express");

const {
  createMatchRoom,
  getAllMatchRooms,
  getMyCreatedMatchRooms,
} = require("../controllers/matchRoomController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/create/:tournamentId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  createMatchRoom,
);

router.get("/", getAllMatchRooms);

router.get(
  "/my-created",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  getMyCreatedMatchRooms,
);

module.exports = router;
