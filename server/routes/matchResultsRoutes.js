const express = require("express");

const { addMatchResult } = require("../controllers/matchResultController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/add", protect, authorizeRoles("admin"), addMatchResult);

module.exports = router;
