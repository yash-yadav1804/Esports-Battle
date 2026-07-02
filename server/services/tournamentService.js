const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const MatchResult = require("../models/MatchResult");
const PrizeDistribution = require("../models/PrizeDistribution");
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

const ensureCanManageTournament = (tournament, user) => {
  if (isPlatformAdmin(user)) return;

  if (user.role === ROLES.ORGANIZER && isTournamentOwner(tournament, user)) {
    return;
  }

  throw new ApiError(403, "You can manage only your own tournaments");
};

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

const createTournament = async (tournamentData, currentUser) => {
  const { title, game, mode, entryFee, prizePool, maxTeams, startDate } =
    tournamentData;

  if (!title || !game || !mode || !startDate) {
    throw new ApiError(400, "Please fill all required fields");
  }

  if (entryFee !== undefined && Number.isNaN(Number(entryFee))) {
    throw new ApiError(400, "Entry fee must be a number");
  }

  if (prizePool !== undefined && Number.isNaN(Number(prizePool))) {
    throw new ApiError(400, "Prize pool must be a number");
  }

  if (maxTeams !== undefined && Number.isNaN(Number(maxTeams))) {
    throw new ApiError(400, "Max teams must be a number");
  }

  if (Number(entryFee) < 0 || Number(prizePool) < 0) {
    throw new ApiError(400, "Entry fee and prize pool cannot be negative");
  }

  if (maxTeams !== undefined && Number(maxTeams) <= 0) {
    throw new ApiError(400, "Max teams must be greater than 0");
  }

  const existingTournament = await Tournament.findOne({
    title: title.trim(),
  });

  if (existingTournament) {
    throw new ApiError(400, "Tournament already exists");
  }

  const tournament = await Tournament.create({
    title: title.trim(),
    game,
    mode,
    entryFee: Number(entryFee) || 0,
    prizePool: Number(prizePool) || 0,
    maxTeams: Number(maxTeams) || 25,
    startDate,
    createdBy: currentUser._id,
  });

  return tournament;
};

const registerTeam = async (tournamentId, currentUser) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  if (tournament.status === "completed") {
    throw new ApiError(400, "Cannot register in completed tournament");
  }

  const team = await Team.findOne({
    players: currentUser._id,
  });

  if (!team) {
    throw new ApiError(400, "You are not in any team");
  }

  const alreadyRegistered = tournament.registeredTeams.some(
    (teamId) => teamId.toString() === team._id.toString(),
  );

  if (alreadyRegistered) {
    throw new ApiError(400, "Team already registered");
  }

  if (tournament.registeredTeams.length >= tournament.maxTeams) {
    throw new ApiError(400, "Tournament is full");
  }

  tournament.registeredTeams.push(team._id);
  await tournament.save();

  return tournament;
};

const getAllTournaments = async () => {
  const tournaments = await Tournament.find()
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  return tournaments;
};

const getMyCreatedTournaments = async (currentUser) => {
  const query = isPlatformAdmin(currentUser)
    ? {}
    : {
        createdBy: currentUser._id,
      };

  const tournaments = await Tournament.find(query)
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  return tournaments;
};

const getTournamentById = async (tournamentId) => {
  const tournament = await Tournament.findById(tournamentId)
    .populate("registeredTeams")
    .populate("createdBy", "name email role");

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  return tournament;
};

const leaveTournament = async (tournamentId, currentUser) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  if (tournament.status === "live") {
    throw new ApiError(400, "Cannot leave tournament after it has started");
  }

  if (tournament.status === "completed") {
    throw new ApiError(400, "Cannot leave completed tournament");
  }

  const team = await Team.findOne({
    players: currentUser._id,
  });

  if (!team) {
    throw new ApiError(400, "You are not in any team");
  }

  const isRegistered = tournament.registeredTeams.some(
    (teamId) => teamId.toString() === team._id.toString(),
  );

  if (!isRegistered) {
    throw new ApiError(400, "Team is not registered in this tournament");
  }

  tournament.registeredTeams.pull(team._id);
  await tournament.save();

  return tournament;
};

const startTournament = async (tournamentId, currentUser) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  ensureCanManageTournament(tournament, currentUser);

  if (tournament.status === "live") {
    throw new ApiError(400, "Tournament is already live");
  }

  if (tournament.status === "completed") {
    throw new ApiError(400, "Tournament is already completed");
  }

  if (tournament.registeredTeams.length === 0) {
    throw new ApiError(400, "No teams registered");
  }

  tournament.status = "live";
  await tournament.save();

  await notifyTournamentPlayers(
    tournament,
    "Tournament Started",
    `${tournament.title} has started. Join your match room on time.`,
  );

  return tournament;
};

const completeTournament = async (tournamentId, currentUser) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  ensureCanManageTournament(tournament, currentUser);

  if (tournament.status === "completed") {
    throw new ApiError(400, "Tournament already completed");
  }

  const results = await MatchResult.find({
    tournament: tournamentId,
  }).populate("team", "teamName");

  if (results.length === 0) {
    throw new ApiError(400, "No match results found");
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

  return {
    tournament,
    winner: sortedTeams[0]?.team?.teamName,
    prizePool,
  };
};

const getTournamentHistory = async () => {
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

  return history;
};

module.exports = {
  createTournament,
  registerTeam,
  getAllTournaments,
  getMyCreatedTournaments,
  getTournamentById,
  leaveTournament,
  startTournament,
  completeTournament,
  getTournamentHistory,
};
