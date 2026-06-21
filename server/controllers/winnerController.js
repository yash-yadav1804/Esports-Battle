const MatchResult = require("../models/MatchResult");

const getWinner = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const results = await MatchResult.find({
      tournament: tournamentId,
    }).populate("team", "teamName");

    const leaderboard = {};

    results.forEach((result) => {
      const teamName = result.team.teamName;

      if (!leaderboard[teamName]) {
        leaderboard[teamName] = 0;
      }

      leaderboard[teamName] += result.totalPoints;
    });

    const leaderboardArray = Object.entries(leaderboard).map(
      ([team, points]) => ({
        team,
        points,
      }),
    );

    leaderboardArray.sort((a, b) => b.points - a.points);

    if (leaderboardArray.length === 0) {
      return res.status(404).json({
        message: "No results found",
      });
    }

    res.status(200).json({
      rank: 1,
      team: leaderboardArray[0].team,
      points: leaderboardArray[0].points,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { getWinner };
