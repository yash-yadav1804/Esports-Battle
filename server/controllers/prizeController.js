const MatchResult = require("../models/MatchResult");
const PrizeDistribution = require("../models/PrizeDistribution");

const generatePrizes = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const results = await MatchResult.find({
      tournament: tournamentId,
    }).populate("team", "teamName");

    if (results.length === 0) {
      return res.status(404).json({
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

    const prizeDistribution = await PrizeDistribution.create({
      tournament: tournamentId,

      firstPlace: {
        team: sortedTeams[0]?._id || sortedTeams[0]?.team?._id,
        amount: 2500,
      },

      secondPlace: {
        team: sortedTeams[1]?.team?._id,
        amount: 1500,
      },

      thirdPlace: {
        team: sortedTeams[2]?.team?._id,
        amount: 1000,
      },
    });

    res.status(201).json({
      message: "Prize distribution generated successfully",
      prizeDistribution,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPrizes = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const prizes = await PrizeDistribution.findOne({
      tournament: tournamentId,
    })
      .populate("firstPlace.team", "teamName")
      .populate("secondPlace.team", "teamName")
      .populate("thirdPlace.team", "teamName");

    if (!prizes) {
      return res.status(404).json({
        message: "Prize distribution not found",
      });
    }

    res.status(200).json(prizes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  generatePrizes,
  getPrizes,
};
