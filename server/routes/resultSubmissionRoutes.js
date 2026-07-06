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
const validateRequest = require("../middleware/validateRequest");

const {
  submitResultSchema,
  submissionIdParamSchema,
  rejectSubmissionSchema,
} = require("../validators/resultSubmissionValidator");

const router = express.Router();

router.post(
  "/submit",
  protect,
  validateRequest(submitResultSchema),
  submitResult,
);

router.get("/my-submissions", protect, getMySubmissions);

router.get(
  "/pending",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  getPendingSubmissions,
);

router.patch(
  "/approve/:submissionId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  validateRequest(submissionIdParamSchema),
  approveSubmission,
);

router.patch(
  "/reject/:submissionId",
  protect,
  authorizeRoles("organizer", "admin", "superAdmin"),
  validateRequest(rejectSubmissionSchema),
  rejectSubmission,
);

module.exports = router;
