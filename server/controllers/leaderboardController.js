const MatchResult = require("../models/MatchResult");

const getLeaderboard = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Get all results of this tournament
    const results = await MatchResult.find({
      tournament: tournamentId,
    }).populate("team", "teamName");

    const leaderboard = {};

    // Calculate total points team-wise
    results.forEach((result) => {
      const teamName = result.team.teamName;

      if (!leaderboard[teamName]) {
        leaderboard[teamName] = 0;
      }

      leaderboard[teamName] += result.totalPoints;
    });

    // Convert object to array
    const leaderboardArray = Object.entries(leaderboard).map(
      ([team, points]) => ({
        team,
        points,
      }),
    );

    // Sort highest points first
    leaderboardArray.sort((a, b) => b.points - a.points);

    // Add rank
    const rankedLeaderboard = leaderboardArray.map((team, index) => ({
      rank: index + 1,
      ...team,
    }));

    res.status(200).json(rankedLeaderboard);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getLeaderboard,
};
