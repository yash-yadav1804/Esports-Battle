const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const MatchResult = require("../models/MatchResult");
const PrizeDistribution = require("../models/PrizeDistribution");

const createTournament = async (req, res) => {
  try {
    const { title, game, mode, entryFee, prizePool, maxTeams, startDate } =
      req.body;

    // Required fields validation
    if (!title || !game || !mode || !startDate) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // Number validation
    if (isNaN(entryFee) || isNaN(prizePool)) {
      return res.status(400).json({
        message: "Entry fee and prize pool must be numbers",
      });
    }

    // Negative value validation
    if (entryFee < 0 || prizePool < 0) {
      return res.status(400).json({
        message: "Value cannot be negative",
      });
    }

    // Duplicate tournament check
    const existingTournament = await Tournament.findOne({
      title,
    });

    if (existingTournament) {
      return res.status(400).json({
        message: "Tournament already exists",
      });
    }

    // Create tournament
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

    // Success response
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

const registerTeam = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    console.log("Tournament ID:", tournamentId);
    console.log("Logged In User ID:", req.user._id);

    const tournament = await Tournament.findById(tournamentId);

    console.log("Tournament:", tournament);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    const team = await Team.findOne({
      players: req.user._id,
    });
    console.log("Team Found:", team);
    if (!team) {
      return res.status(400).json({
        message: "You are not in any team",
      });
    }

    if (tournament.registeredTeams.includes(team._id)) {
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
const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find();

    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
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

const leaveTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);

    const team = await Team.findOne({
      players: req.user._id,
    });
    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }
    if (!team) {
      return res.status(400).json({
        message: "You are not in any team",
      });
    }
    if (!tournament.registeredTeams.includes(team._id)) {
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
module.exports = {
  createTournament,
  registerTeam,
  getAllTournaments,
  getTournamentById,
  leaveTournament,
  startTournament,
  completeTournament,
};
