const OrganizerRequest = require("../models/OrganizerRequest");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { ROLES } = require("../constants/roles");

const createOrganizerRequest = async (requestData, currentUser) => {
  const { organizationName, contactNumber, reason, experience, socialLink } =
    requestData;

  if (!organizationName || !contactNumber || !reason) {
    throw new ApiError(
      400,
      "Organization name, contact number and reason are required",
    );
  }

  const user = await User.findById(currentUser._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === ROLES.ORGANIZER) {
    throw new ApiError(400, "You are already an organizer");
  }

  if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(400, "Admin users do not need organizer access");
  }

  const existingPendingRequest = await OrganizerRequest.findOne({
    user: user._id,
    status: "pending",
  });

  if (existingPendingRequest) {
    throw new ApiError(400, "Your organizer request is already pending");
  }

  const approvedRequest = await OrganizerRequest.findOne({
    user: user._id,
    status: "approved",
  });

  if (approvedRequest) {
    throw new ApiError(400, "Your organizer request is already approved");
  }

  const organizerRequest = await OrganizerRequest.create({
    user: user._id,
    organizationName: organizationName.trim(),
    contactNumber: contactNumber.trim(),
    reason: reason.trim(),
    experience: experience?.trim() || "",
    socialLink: socialLink?.trim() || "",
  });

  return organizerRequest;
};

const getMyOrganizerRequests = async (currentUser) => {
  const requests = await OrganizerRequest.find({
    user: currentUser._id,
  }).sort({ createdAt: -1 });

  return requests;
};

const getPendingOrganizerRequests = async () => {
  const requests = await OrganizerRequest.find({ status: "pending" })
    .populate("user", "name email ign bgmiUID role")
    .sort({ createdAt: -1 });

  return requests;
};

const approveOrganizerRequest = async (
  requestId,
  adminUser,
  adminNote = "",
) => {
  const organizerRequest = await OrganizerRequest.findById(requestId).populate(
    "user",
    "name email role",
  );

  if (!organizerRequest) {
    throw new ApiError(404, "Organizer request not found");
  }

  if (organizerRequest.status !== "pending") {
    throw new ApiError(400, "This request is already reviewed");
  }

  const user = await User.findById(organizerRequest.user._id);

  if (!user) {
    throw new ApiError(404, "Request user not found");
  }

  user.role = ROLES.ORGANIZER;
  await user.save();

  organizerRequest.status = "approved";
  organizerRequest.adminNote = adminNote;
  organizerRequest.reviewedBy = adminUser._id;
  organizerRequest.reviewedAt = new Date();

  await organizerRequest.save();

  return organizerRequest;
};

const rejectOrganizerRequest = async (requestId, adminUser, adminNote = "") => {
  const organizerRequest = await OrganizerRequest.findById(requestId);

  if (!organizerRequest) {
    throw new ApiError(404, "Organizer request not found");
  }

  if (organizerRequest.status !== "pending") {
    throw new ApiError(400, "This request is already reviewed");
  }

  organizerRequest.status = "rejected";
  organizerRequest.adminNote = adminNote;
  organizerRequest.reviewedBy = adminUser._id;
  organizerRequest.reviewedAt = new Date();

  await organizerRequest.save();

  return organizerRequest;
};

module.exports = {
  createOrganizerRequest,
  getMyOrganizerRequests,
  getPendingOrganizerRequests,
  approveOrganizerRequest,
  rejectOrganizerRequest,
};
