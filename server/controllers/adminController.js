const User = require("../models/User");
const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const MatchRoom = require("../models/MatchRoom");
const MatchResult = require("../models/MatchResult");
const PrizeDistribution = require("../models/PrizeDistribution");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    await team.deleteOne();

    res.status(200).json({
      message: "Team deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    // Delete related match rooms
    await MatchRoom.deleteMany({ tournament: tournamentId });

    // Delete related match results
    await MatchResult.deleteMany({ tournament: tournamentId });

    // Delete related prize distribution
    await PrizeDistribution.deleteMany({ tournament: tournamentId });

    // Delete tournament
    await tournament.deleteOne();

    res.status(200).json({
      message: "Tournament and related data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (tournament.status === "completed") {
      return res.status(400).json({
        message: "Completed tournament cannot be updated",
      });
    }

    const { title, game, mode, entryFee, prizePool, maxTeams, startDate } =
      req.body;

    if (title !== undefined) tournament.title = title;
    if (game !== undefined) tournament.game = game;
    if (mode !== undefined) tournament.mode = mode;
    if (entryFee !== undefined) tournament.entryFee = entryFee;
    if (prizePool !== undefined) tournament.prizePool = prizePool;
    if (maxTeams !== undefined) tournament.maxTeams = maxTeams;
    if (startDate !== undefined) tournament.startDate = startDate;

    await tournament.save();

    res.status(200).json({
      message: "Tournament updated successfully",
      tournament,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { teamName, maxPlayers } = req.body;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    if (teamName !== undefined) {
      const formattedTeamName = teamName.toLowerCase();

      const existingTeam = await Team.findOne({
        teamName: formattedTeamName,
        _id: { $ne: teamId },
      });

      if (existingTeam) {
        return res.status(400).json({
          message: "Team name already exists",
        });
      }

      team.teamName = formattedTeamName;
    }

    if (maxPlayers !== undefined) {
      if (maxPlayers < team.players.length) {
        return res.status(400).json({
          message: "Max players cannot be less than current team players",
        });
      }

      team.maxPlayers = maxPlayers;
    }

    await team.save();

    res.status(200).json({
      message: "Team updated successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPlayers = await User.countDocuments({ role: "player" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

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
          totalAdmins,
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
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  getAllUsers,
  deleteUser,
  deleteTeam,
  deleteTournament,
  updateTournament,
  updateTeam,
  getDashboardStats,
};
