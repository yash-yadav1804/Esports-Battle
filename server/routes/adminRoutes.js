const express = require("express");

const {
  getAllUsers,
  deleteUser,
  deleteTeam,
  deleteTournament,
  updateTournament,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

router.delete("/users/:userId", protect, authorizeRoles("admin"), deleteUser);
router.delete("/teams/:teamId", protect, authorizeRoles("admin"), deleteTeam);
router.delete(
  "/tournaments/:tournamentId",
  protect,
  authorizeRoles("admin"),
  deleteTournament,
);
router.patch(
  "/tournaments/:tournamentId",
  protect,
  authorizeRoles("admin"),
  updateTournament,
);

module.exports = router;
