const express = require("express");

const {
  sendRequest,
  getTeamRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/teamRequestController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send/:teamId", protect, sendRequest);

router.get("/team/:teamId", protect, getTeamRequests);

router.patch("/approve/:requestId", protect, approveRequest);

router.patch("/reject/:requestId", protect, rejectRequest);

module.exports = router;
