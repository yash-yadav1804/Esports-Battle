const express = require("express");

const {
  getAllUsers,
  deleteUser,
  deleteTeam,
  updateTeam,
  getDashboardStats,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/users",
  protect,
  authorizeRoles("admin", "superAdmin"),
  getAllUsers,
);

router.get(
  "/dashboard-stats",
  protect,
  authorizeRoles("admin", "superAdmin"),
  getDashboardStats,
);

router.delete(
  "/users/:userId",
  protect,
  authorizeRoles("admin", "superAdmin"),
  deleteUser,
);

router.delete(
  "/teams/:teamId",
  protect,
  authorizeRoles("admin", "superAdmin"),
  deleteTeam,
);

router.patch(
  "/teams/:teamId",
  protect,
  authorizeRoles("admin", "superAdmin"),
  updateTeam,
);

module.exports = router;
