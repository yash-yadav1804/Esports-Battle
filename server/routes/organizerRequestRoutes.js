const express = require("express");

const {
  createOrganizerRequest,
  getMyOrganizerRequests,
  getPendingOrganizerRequests,
  approveOrganizerRequest,
  rejectOrganizerRequest,
} = require("../controllers/organizerRequestController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/request", protect, createOrganizerRequest);

router.get("/my-requests", protect, getMyOrganizerRequests);

router.get(
  "/pending",
  protect,
  authorizeRoles("admin", "superAdmin"),
  getPendingOrganizerRequests,
);

router.patch(
  "/approve/:requestId",
  protect,
  authorizeRoles("admin", "superAdmin"),
  approveOrganizerRequest,
);

router.patch(
  "/reject/:requestId",
  protect,
  authorizeRoles("admin", "superAdmin"),
  rejectOrganizerRequest,
);

module.exports = router;
