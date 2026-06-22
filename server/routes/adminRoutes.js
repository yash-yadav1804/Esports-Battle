const express = require("express");

const { getAllUsers, deleteUser } = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

router.delete("/users/:userId", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;
