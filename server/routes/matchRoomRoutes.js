const express = require("express");

const {
  createMatchRoom,
  getAllMatchRooms,
  getMyCreatedMatchRooms,
  getEligibleMatchRooms,
  getMatchRoomById,
  updateMatchRoom,
  deleteMatchRoom,
} = require("../controllers/matchRoomController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  createMatchRoomSchema,
  updateMatchRoomSchema,
  matchRoomIdParamSchema,
} = require("../validators/matchRoomValidator");

const router = express.Router();

router.post(
  "/create/:tournamentId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  validateRequest(createMatchRoomSchema),
  createMatchRoom,
);

router.get("/", getAllMatchRooms);

router.get(
  "/my-created",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  getMyCreatedMatchRooms,
);
router.get("/eligible", protect, getEligibleMatchRooms);

router.patch(
  "/manage/:matchRoomId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  validateRequest(updateMatchRoomSchema),
  updateMatchRoom,
);

router.delete(
  "/manage/:matchRoomId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  validateRequest(matchRoomIdParamSchema),
  deleteMatchRoom,
);

router.get(
  "/:matchRoomId",
  validateRequest(matchRoomIdParamSchema),
  getMatchRoomById,
);

module.exports = router;
