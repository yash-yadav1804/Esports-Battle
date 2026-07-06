const ResultSubmission = require("../models/ResultSubmission");
const MatchResult = require("../models/MatchResult");
const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const MatchRoom = require("../models/MatchRoom");
const Notification = require("../models/Notification");

const ApiError = require("../utils/ApiError");
const { ROLES } = require("../constants/roles");

const isPlatformAdmin = (user) => {
  return user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;
};

const isTournamentOwner = (tournament, user) => {
  if (!tournament.createdBy) return false;

  return tournament.createdBy.toString() === user._id.toString();
};

const ensureCanReviewSubmission = async (submission, currentUser) => {
  if (isPlatformAdmin(currentUser)) return;

  const tournament = await Tournament.findById(submission.tournament);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  if (
    currentUser.role === ROLES.ORGANIZER &&
    isTournamentOwner(tournament, currentUser)
  ) {
    return;
  }

  throw new ApiError(
    403,
    "You can review results only for your own tournaments",
  );
};

const calculatePlacementPoints = (position) => {
  if (position === 1) return 15;
  if (position === 2) return 12;
  if (position === 3) return 10;
  if (position === 4) return 8;
  if (position === 5) return 6;

  return 0;
};

const submitResult = async (resultData, currentUser) => {
  const { tournamentId, matchRoomId, kills, position } = resultData;

  if (!tournamentId || !matchRoomId || kills === undefined || !position) {
    throw new ApiError(
      400,
      "Please provide tournamentId, matchRoomId, kills and position",
    );
  }

  if (Number(kills) < 0) {
    throw new ApiError(400, "Kills cannot be negative");
  }

  if (Number(position) <= 0) {
    throw new ApiError(400, "Position must be greater than 0");
  }

  const team = await Team.findOne({
    players: currentUser._id,
  });

  if (!team) {
    throw new ApiError(400, "You are not in any team");
  }

  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  if (tournament.status === "completed") {
    throw new ApiError(400, "Cannot submit result for completed tournament");
  }

  const matchRoom = await MatchRoom.findById(matchRoomId);

  if (!matchRoom) {
    throw new ApiError(404, "Match room not found");
  }

  if (matchRoom.tournament.toString() !== tournamentId.toString()) {
    throw new ApiError(400, "Match room does not belong to this tournament");
  }

  const isRegistered = tournament.registeredTeams.some(
    (teamId) => teamId.toString() === team._id.toString(),
  );

  if (!isRegistered) {
    throw new ApiError(400, "Your team is not registered in this tournament");
  }

  const existingSubmission = await ResultSubmission.findOne({
    team: team._id,
    matchRoom: matchRoomId,
    status: "pending",
  });

  if (existingSubmission) {
    throw new ApiError(400, "Result submission already pending for this match");
  }

  const existingResult = await MatchResult.findOne({
    team: team._id,
    matchRoom: matchRoomId,
  });

  if (existingResult) {
    throw new ApiError(400, "Result already approved for this match");
  }

  const submission = await ResultSubmission.create({
    team: team._id,
    tournament: tournamentId,
    matchRoom: matchRoomId,
    submittedBy: currentUser._id,
    kills: Number(kills),
    position: Number(position),
  });

  return submission;
};

const getPendingSubmissions = async (currentUser) => {
  let query = {
    status: "pending",
  };

  if (currentUser.role === ROLES.ORGANIZER) {
    const myTournaments = await Tournament.find({
      createdBy: currentUser._id,
    }).select("_id");

    const tournamentIds = myTournaments.map((tournament) => tournament._id);

    query = {
      status: "pending",
      tournament: { $in: tournamentIds },
    };
  }

  const submissions = await ResultSubmission.find(query)
    .populate("team", "teamName")
    .populate("tournament", "title game mode createdBy")
    .populate("matchRoom", "roomId matchNumber map matchTime")
    .populate("submittedBy", "name email ign bgmiUID")
    .sort({ createdAt: -1 });

  return submissions;
};

const approveSubmission = async (submissionId, currentUser) => {
  const submission = await ResultSubmission.findById(submissionId);

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  await ensureCanReviewSubmission(submission, currentUser);

  if (submission.status !== "pending") {
    throw new ApiError(400, `Submission already ${submission.status}`);
  }

  const existingResult = await MatchResult.findOne({
    team: submission.team,
    matchRoom: submission.matchRoom,
  });

  if (existingResult) {
    throw new ApiError(
      400,
      "Match result already exists for this team and match room",
    );
  }

  const placementPoints = calculatePlacementPoints(submission.position);
  const killPoints = submission.kills * 2;
  const totalPoints = killPoints + placementPoints;

  const matchResult = await MatchResult.create({
    team: submission.team,
    tournament: submission.tournament,
    matchRoom: submission.matchRoom,
    kills: submission.kills,
    position: submission.position,
    killPoints,
    placementPoints,
    totalPoints,
  });

  submission.status = "approved";
  submission.adminNote = "Approved";
  await submission.save();

  await Notification.create({
    user: submission.submittedBy,
    title: "Result Approved",
    message: `Your result has been approved. Total points: ${totalPoints}`,
    type: "result_submission",
  });

  return matchResult;
};

const rejectSubmission = async (submissionId, currentUser, adminNote = "") => {
  const submission = await ResultSubmission.findById(submissionId);

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  await ensureCanReviewSubmission(submission, currentUser);

  if (submission.status !== "pending") {
    throw new ApiError(400, `Submission already ${submission.status}`);
  }

  submission.status = "rejected";
  submission.adminNote = adminNote || "Rejected by reviewer";

  await submission.save();

  await Notification.create({
    user: submission.submittedBy,
    title: "Result Rejected",
    message: submission.adminNote,
    type: "result_submission",
  });

  return submission;
};

const getMySubmissions = async (currentUser) => {
  const submissions = await ResultSubmission.find({
    submittedBy: currentUser._id,
  })
    .populate("team", "teamName")
    .populate("tournament", "title game")
    .populate("matchRoom", "roomId matchNumber map matchTime")
    .sort({ createdAt: -1 });

  return submissions;
};

module.exports = {
  submitResult,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  getMySubmissions,
};
