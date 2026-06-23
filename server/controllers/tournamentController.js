const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const MatchResult = require("../models/MatchResult");
const PrizeDistribution = require("../models/PrizeDistribution");
const Notification = require("../models/Notification");

// notify all players of registered teams
const notifyTournamentPlayers = async (tournament, title, message) => {
  const teams = await Team.find({
    _id: { $in: tournament.registeredTeams },
  });

  const userIds = new Set();

  teams.forEach((team) => {
    team.players.forEach((playerId) => {
      userIds.add(playerId.toString());
    });

    userIds.add(team.igl.toString());
  });

  const notifications = Array.from(userIds).map((userId) => ({
    user: userId,
    title,
    message,
    type: "tournament",
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
};

// Create Tournament
const createTournament = async (req, res) => {
  try {
    const { title, game, mode, entryFee, prizePool, maxTeams, startDate } =
      req.body;

    if (!title || !game || !mode || !startDate) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (entryFee !== undefined && isNaN(entryFee)) {
      return res.status(400).json({
        message: "Entry fee must be a number",
      });
    }

    if (prizePool !== undefined && isNaN(prizePool)) {
      return res.status(400).json({
        message: "Prize pool must be a number",
      });
    }

    if (entryFee < 0 || prizePool < 0) {
      return res.status(400).json({
        message: "Value cannot be negative",
      });
    }

    const existingTournament = await Tournament.findOne({ title });

    if (existingTournament) {
      return res.status(400).json({
        message: "Tournament already exists",
      });
    }

    const tournament = await Tournament.create({
      title,
      game,
      mode,
      entryFee,
      prizePool,
      maxTeams,
      startDate,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Tournament created successfully",
      tournament,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Register Team in Tournament
const registerTeam = async (req, res) => {
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
        message: "Cannot register in completed tournament",
      });
    }

    const team = await Team.findOne({
      players: req.user._id,
    });

    if (!team) {
      return res.status(400).json({
        message: "You are not in any team",
      });
    }

    const alreadyRegistered = tournament.registeredTeams.some(
      (teamId) => teamId.toString() === team._id.toString(),
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        message: "Team already registered",
      });
    }

    if (tournament.registeredTeams.length >= tournament.maxTeams) {
      return res.status(400).json({
        message: "Tournament is full",
      });
    }

    tournament.registeredTeams.push(team._id);

    await tournament.save();

    res.status(200).json({
      message: "Team registered successfully",
      tournament,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Tournaments
const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });

    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Tournament By ID
const getTournamentById = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament =
      await Tournament.findById(tournamentId).populate("registeredTeams");

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Leave Tournament
const leaveTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (tournament.status === "live") {
      return res.status(400).json({
        message: "Cannot leave tournament after it has started",
      });
    }

    if (tournament.status === "completed") {
      return res.status(400).json({
        message: "Cannot leave completed tournament",
      });
    }

    const team = await Team.findOne({
      players: req.user._id,
    });

    if (!team) {
      return res.status(400).json({
        message: "You are not in any team",
      });
    }

    const isRegistered = tournament.registeredTeams.some(
      (teamId) => teamId.toString() === team._id.toString(),
    );

    if (!isRegistered) {
      return res.status(400).json({
        message: "Team is not registered in this tournament",
      });
    }

    tournament.registeredTeams.pull(team._id);

    await tournament.save();

    res.status(200).json({
      message: "Left tournament successfully",
      tournament,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Start Tournament
const startTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (tournament.status === "live") {
      return res.status(400).json({
        message: "Tournament is already live",
      });
    }

    if (tournament.status === "completed") {
      return res.status(400).json({
        message: "Tournament is already completed",
      });
    }

    if (tournament.registeredTeams.length === 0) {
      return res.status(400).json({
        message: "No teams registered",
      });
    }

    tournament.status = "live";

    await tournament.save();

    await notifyTournamentPlayers(
      tournament,
      "Tournament Started",
      `${tournament.title} has started. Join your match room on time.`,
    );

    res.status(200).json({
      message: "Tournament started successfully",
      tournament,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Complete Tournament
const completeTournament = async (req, res) => {
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
        message: "Tournament already completed",
      });
    }

    const results = await MatchResult.find({
      tournament: tournamentId,
    }).populate("team", "teamName");

    if (results.length === 0) {
      return res.status(400).json({
        message: "No match results found",
      });
    }

    const leaderboard = {};

    results.forEach((result) => {
      const teamId = result.team._id.toString();

      if (!leaderboard[teamId]) {
        leaderboard[teamId] = {
          team: result.team,
          points: 0,
        };
      }

      leaderboard[teamId].points += result.totalPoints;
    });

    const sortedTeams = Object.values(leaderboard).sort(
      (a, b) => b.points - a.points,
    );

    const prizePool = tournament.prizePool;

    const firstPrize = Math.floor(prizePool * 0.5);
    const secondPrize = Math.floor(prizePool * 0.3);
    const thirdPrize = Math.floor(prizePool * 0.2);

    await PrizeDistribution.create({
      tournament: tournamentId,

      firstPlace: {
        team: sortedTeams[0]?.team?._id,
        amount: firstPrize,
      },

      secondPlace: {
        team: sortedTeams[1]?.team?._id,
        amount: secondPrize,
      },

      thirdPlace: {
        team: sortedTeams[2]?.team?._id,
        amount: thirdPrize,
      },
    });

    tournament.status = "completed";

    await tournament.save();

    await notifyTournamentPlayers(
      tournament,
      "Tournament Completed",
      `${tournament.title} has been completed. Winner: ${sortedTeams[0]?.team?.teamName}`,
    );

    res.status(200).json({
      message: "Tournament completed successfully",
      winner: sortedTeams[0]?.team?.teamName,
      prizePool,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Completed Tournament History
const getTournamentHistory = async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      status: "completed",
    }).sort({ updatedAt: -1 });

    const history = [];

    for (const tournament of tournaments) {
      const prize = await PrizeDistribution.findOne({
        tournament: tournament._id,
      })
        .populate("firstPlace.team", "teamName")
        .populate("secondPlace.team", "teamName")
        .populate("thirdPlace.team", "teamName");

      history.push({
        tournamentId: tournament._id,
        tournamentName: tournament.title,
        game: tournament.game,
        mode: tournament.mode,
        prizePool: tournament.prizePool,
        entryFee: tournament.entryFee,
        totalRegisteredTeams: tournament.registeredTeams.length,

        winner: prize?.firstPlace?.team?.teamName || "No winner found",

        firstPlace: {
          team: prize?.firstPlace?.team?.teamName || null,
          amount: prize?.firstPlace?.amount || 0,
        },

        secondPlace: {
          team: prize?.secondPlace?.team?.teamName || null,
          amount: prize?.secondPlace?.amount || 0,
        },

        thirdPlace: {
          team: prize?.thirdPlace?.team?.teamName || null,
          amount: prize?.thirdPlace?.amount || 0,
        },

        completedAt: tournament.updatedAt,
      });
    }

    res.status(200).json({
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTournament,
  registerTeam,
  getAllTournaments,
  getTournamentById,
  leaveTournament,
  startTournament,
  completeTournament,
  getTournamentHistory,
};
