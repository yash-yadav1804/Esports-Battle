const express = require("express");

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, getMyNotifications);

router.patch("/read-all", protect, markAllNotificationsAsRead);

router.patch("/read/:notificationId", protect, markNotificationAsRead);

module.exports = router;
