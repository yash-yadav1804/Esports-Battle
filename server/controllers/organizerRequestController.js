const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const organizerRequestService = require("../services/organizerRequestService");

const createOrganizerRequest = asyncHandler(async (req, res) => {
  const request = await organizerRequestService.createOrganizerRequest(
    req.body,
    req.user,
  );

  res
    .status(201)
    .json(new ApiResponse(201, request, "Organizer request submitted"));
});

const getMyOrganizerRequests = asyncHandler(async (req, res) => {
  const requests = await organizerRequestService.getMyOrganizerRequests(
    req.user,
  );

  res
    .status(200)
    .json(new ApiResponse(200, requests, "My organizer requests fetched"));
});

const getPendingOrganizerRequests = asyncHandler(async (req, res) => {
  const requests = await organizerRequestService.getPendingOrganizerRequests();

  res
    .status(200)
    .json(new ApiResponse(200, requests, "Pending organizer requests fetched"));
});

const approveOrganizerRequest = asyncHandler(async (req, res) => {
  const adminNote = req.body?.adminNote || "";

  const request = await organizerRequestService.approveOrganizerRequest(
    req.params.requestId,
    req.user,
    adminNote,
  );

  res
    .status(200)
    .json(new ApiResponse(200, request, "Organizer request approved"));
});

const rejectOrganizerRequest = asyncHandler(async (req, res) => {
  const adminNote = req.body?.adminNote || "";

  const request = await organizerRequestService.rejectOrganizerRequest(
    req.params.requestId,
    req.user,
    adminNote,
  );

  res
    .status(200)
    .json(new ApiResponse(200, request, "Organizer request rejected"));
});

module.exports = {
  createOrganizerRequest,
  getMyOrganizerRequests,
  getPendingOrganizerRequests,
  approveOrganizerRequest,
  rejectOrganizerRequest,
};
