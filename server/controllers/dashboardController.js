const Tournament = require("../models/Tournament");
const MatchRoom = require("../models/MatchRoom");
const MatchResult = require("../models/MatchResult");

const getTournamentDashboard = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    const totalRooms = await MatchRoom.countDocuments({
      tournament: tournamentId,
    });

    const totalResults = await MatchResult.countDocuments({
      tournament: tournamentId,
    });

    const totalTeams = tournament.registeredTeams.length;

    // Leaderboard Logic
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

    const rankedLeaderboard = leaderboardArray.map((team, index) => ({
      rank: index + 1,
      team: team.team,
      points: team.points,
    }));

    const winner =
      rankedLeaderboard.length > 0
        ? rankedLeaderboard[0].team
        : "No Winner Yet";

    res.status(200).json({
      tournamentName: tournament.title,
      game: tournament.game,
      status: tournament.status,

      totalTeams,
      totalRooms,
      totalResults,

      winner,
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { getTournamentDashboard };
