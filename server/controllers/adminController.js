const User = require("../models/User");
const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const MatchRoom = require("../models/MatchRoom");
const MatchResult = require("../models/MatchResult");
const PrizeDistribution = require("../models/PrizeDistribution");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const isSuperAdmin = (user) => {
  return user.role === "superAdmin";
};

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    count: users.length,
    users,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  if (user.role === "superAdmin") {
    throw new ApiError(403, "SuperAdmin account cannot be deleted");
  }

  if (user.role === "admin" && !isSuperAdmin(req.user)) {
    throw new ApiError(403, "Only SuperAdmin can delete admin users");
  }

  await user.deleteOne();

  res.status(200).json({
    message: "User deleted successfully",
  });
});

const deleteTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  await team.deleteOne();

  res.status(200).json({
    message: "Team deleted successfully",
  });
});

const updateTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { teamName, maxPlayers } = req.body;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  if (teamName !== undefined) {
    const formattedTeamName = teamName.toLowerCase().trim();

    if (!formattedTeamName) {
      throw new ApiError(400, "Team name cannot be empty");
    }

    const existingTeam = await Team.findOne({
      teamName: formattedTeamName,
      _id: { $ne: teamId },
    });

    if (existingTeam) {
      throw new ApiError(400, "Team name already exists");
    }

    team.teamName = formattedTeamName;
  }

  if (maxPlayers !== undefined) {
    if (Number(maxPlayers) < team.players.length) {
      throw new ApiError(
        400,
        "Max players cannot be less than current team players",
      );
    }

    team.maxPlayers = Number(maxPlayers);
  }

  await team.save();

  res.status(200).json({
    message: "Team updated successfully",
    team,
  });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalPlayers = await User.countDocuments({ role: "player" });
  const totalOrganizers = await User.countDocuments({ role: "organizer" });
  const totalAdmins = await User.countDocuments({ role: "admin" });
  const totalSuperAdmins = await User.countDocuments({ role: "superAdmin" });

  const totalTeams = await Team.countDocuments();

  const totalTournaments = await Tournament.countDocuments();
  const upcomingTournaments = await Tournament.countDocuments({
    status: "upcoming",
  });
  const liveTournaments = await Tournament.countDocuments({
    status: "live",
  });
  const completedTournaments = await Tournament.countDocuments({
    status: "completed",
  });

  const totalMatchRooms = await MatchRoom.countDocuments();
  const totalMatchResults = await MatchResult.countDocuments();

  const prizes = await PrizeDistribution.find();

  let totalPrizeDistributed = 0;

  prizes.forEach((prize) => {
    totalPrizeDistributed += prize.firstPlace?.amount || 0;
    totalPrizeDistributed += prize.secondPlace?.amount || 0;
    totalPrizeDistributed += prize.thirdPlace?.amount || 0;
  });

  res.status(200).json({
    message: "Dashboard stats fetched successfully",
    stats: {
      users: {
        totalUsers,
        totalPlayers,
        totalOrganizers,
        totalAdmins,
        totalSuperAdmins,
      },
      teams: {
        totalTeams,
      },
      tournaments: {
        totalTournaments,
        upcomingTournaments,
        liveTournaments,
        completedTournaments,
      },
      matches: {
        totalMatchRooms,
        totalMatchResults,
      },
      prizes: {
        totalPrizeDistributed,
      },
    },
  });
});

module.exports = {
  getAllUsers,
  deleteUser,
  deleteTeam,
  updateTeam,
  getDashboardStats,
};
