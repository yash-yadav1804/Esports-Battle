const express = require("express");

const {
  getAllUsers,
  deleteUser,
  deleteTeam,
  deleteTournament,
  updateTournament,
  updateTeam,
  getDashboardStats,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.get(
  "/dashboard-stats",
  protect,
  authorizeRoles("admin"),
  getDashboardStats,
);

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
router.patch("/teams/:teamId", protect, authorizeRoles("admin"), updateTeam);
module.exports = router;
