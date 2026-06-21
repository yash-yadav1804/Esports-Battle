const express = require("express");

const {
  addMatchResult,
  getAllMatchResults,
} = require("../controllers/matchResultController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin adds match result
router.post("/add", protect, authorizeRoles("admin"), addMatchResult);

// Get all match results
router.get("/", getAllMatchResults);

module.exports = router;
