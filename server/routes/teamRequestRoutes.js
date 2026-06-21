const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  sendRequest,
  getTeamRequests,
  approveRequest,
} = require("../controllers/teamRequestController");

const router = express.Router();

router.post("/send/:teamId", protect, sendRequest);

router.get("/team/:teamId", protect, getTeamRequests);
router.patch("/approve/:requestId", protect, approveRequest);

module.exports = router;
