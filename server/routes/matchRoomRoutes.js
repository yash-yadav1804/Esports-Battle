const express = require("express");
const {
  createMatchRoom,
  getAllMatchRooms,
} = require("../controllers/matchRoomController");
const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/create/:tournamentId",
  protect,
  authorizeRoles("admin"),
  createMatchRoom,
);
router.get("/", getAllMatchRooms);

module.exports = router;
