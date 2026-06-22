const express = require("express");

const {
  submitResult,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  getMySubmissions,
} = require("../controllers/resultSubmissionController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/submit", protect, submitResult);

router.get("/my-submissions", protect, getMySubmissions);

router.get("/pending", protect, authorizeRoles("admin"), getPendingSubmissions);

router.patch(
  "/approve/:submissionId",
  protect,
  authorizeRoles("admin"),
  approveSubmission,
);

router.patch(
  "/reject/:submissionId",
  protect,
  authorizeRoles("admin"),
  rejectSubmission,
);

module.exports = router;
