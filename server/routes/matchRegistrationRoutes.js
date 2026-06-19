const express = require("express");
const protect = require("../middleware/authMiddleware");

const { joinMatchRoom } = require("../controllers/matchRegistrationController");

const router = express.Router();

router.post("/join/:roomId", protect, joinMatchRoom);

module.exports = router;
