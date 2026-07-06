const asyncHandler = require("../utils/asyncHandler");
const resultSubmissionService = require("../services/resultSubmissionService");

const submitResult = asyncHandler(async (req, res) => {
  const submission = await resultSubmissionService.submitResult(
    req.body,
    req.user,
  );

  res.status(201).json({
    message: "Result submitted successfully. Waiting for review.",
    submission,
  });
});

const getPendingSubmissions = asyncHandler(async (req, res) => {
  const submissions = await resultSubmissionService.getPendingSubmissions(
    req.user,
  );

  res.status(200).json({
    count: submissions.length,
    submissions,
  });
});

const approveSubmission = asyncHandler(async (req, res) => {
  const matchResult = await resultSubmissionService.approveSubmission(
    req.params.submissionId,
    req.user,
  );

  res.status(200).json({
    message: "Submission approved and match result created successfully",
    matchResult,
  });
});

const rejectSubmission = asyncHandler(async (req, res) => {
  const submission = await resultSubmissionService.rejectSubmission(
    req.params.submissionId,
    req.user,
    req.body?.adminNote || "",
  );

  res.status(200).json({
    message: "Submission rejected successfully",
    submission,
  });
});

const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await resultSubmissionService.getMySubmissions(req.user);

  res.status(200).json({
    count: submissions.length,
    submissions,
  });
});

module.exports = {
  submitResult,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  getMySubmissions,
};
