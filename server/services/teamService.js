const Team = require("../models/Team");
const ApiError = require("../utils/ApiError");

const formatTeamName = (teamName) => {
  return teamName.trim().toLowerCase();
};

const populateTeam = (query) => {
  return query
    .populate("igl", "name email ign bgmiUID role")
    .populate("players", "name email ign bgmiUID role");
};

const isSameId = (idOne, idTwo) => {
  return idOne.toString() === idTwo.toString();
};

const isPlayerInTeam = (team, playerId) => {
  return team.players.some((existingPlayerId) =>
    isSameId(existingPlayerId, playerId),
  );
};

const isTeamCaptain = (team, userId) => {
  return team.igl && isSameId(team.igl, userId);
};

const getUserTeam = async (userId) => {
  return Team.findOne({
    players: userId,
  });
};

const createTeam = async (teamData, currentUser) => {
  const { teamName } = teamData;

  const formattedTeamName = formatTeamName(teamName);

  const existingTeamName = await Team.findOne({
    teamName: formattedTeamName,
  });

  if (existingTeamName) {
    throw new ApiError(400, "Team name already exists");
  }

  const existingUserTeam = await getUserTeam(currentUser._id);

  if (existingUserTeam) {
    throw new ApiError(400, "You are already part of a team");
  }

  const team = await Team.create({
    teamName: formattedTeamName,
    igl: currentUser._id,
    players: [currentUser._id],
  });

  const populatedTeam = await populateTeam(Team.findById(team._id));

  return populatedTeam;
};

const joinTeam = async (teamId, currentUser) => {
  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  const existingUserTeam = await getUserTeam(currentUser._id);

  if (existingUserTeam) {
    throw new ApiError(400, "You are already part of a team");
  }

  if (isPlayerInTeam(team, currentUser._id)) {
    throw new ApiError(400, "You are already in this team");
  }

  if (team.maxPlayers && team.players.length >= team.maxPlayers) {
    throw new ApiError(400, "Team is already full");
  }

  team.players.push(currentUser._id);

  await team.save();

  const populatedTeam = await populateTeam(Team.findById(team._id));

  return populatedTeam;
};

const getAllTeams = async () => {
  const teams = await populateTeam(Team.find().sort({ createdAt: -1 }));

  return teams;
};

const getTeamById = async (teamId) => {
  const team = await populateTeam(Team.findById(teamId));

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  return team;
};

const leaveTeam = async (currentUser) => {
  const team = await Team.findOne({
    players: currentUser._id,
  });

  if (!team) {
    throw new ApiError(404, "You are not part of any team");
  }

  const remainingPlayers = team.players.filter(
    (playerId) => !isSameId(playerId, currentUser._id),
  );

  if (remainingPlayers.length === 0) {
    await team.deleteOne();

    return {
      teamDeleted: true,
      team: null,
    };
  }

  if (isTeamCaptain(team, currentUser._id)) {
    team.igl = remainingPlayers[0];
  }

  team.players = remainingPlayers;

  await team.save();

  const updatedTeam = await populateTeam(Team.findById(team._id));

  return {
    teamDeleted: false,
    team: updatedTeam,
  };
};

const removePlayerFromTeam = async (playerId, currentUser) => {
  const team = await Team.findOne({
    players: currentUser._id,
  });

  if (!team) {
    throw new ApiError(404, "You are not part of any team");
  }

  if (!isTeamCaptain(team, currentUser._id)) {
    throw new ApiError(403, "Only team captain can remove players");
  }

  if (isSameId(playerId, currentUser._id)) {
    throw new ApiError(
      400,
      "Captain cannot remove themselves. Use leave team.",
    );
  }

  if (!isPlayerInTeam(team, playerId)) {
    throw new ApiError(404, "Player is not part of your team");
  }

  team.players = team.players.filter(
    (existingPlayerId) => !isSameId(existingPlayerId, playerId),
  );

  await team.save();

  const updatedTeam = await populateTeam(Team.findById(team._id));

  return updatedTeam;
};

const transferCaptain = async (newCaptainId, currentUser) => {
  const team = await Team.findOne({
    players: currentUser._id,
  });

  if (!team) {
    throw new ApiError(404, "You are not part of any team");
  }

  if (!isTeamCaptain(team, currentUser._id)) {
    throw new ApiError(403, "Only current captain can transfer captaincy");
  }

  if (isSameId(newCaptainId, currentUser._id)) {
    throw new ApiError(400, "You are already the captain");
  }

  if (!isPlayerInTeam(team, newCaptainId)) {
    throw new ApiError(400, "New captain must be a player in your team");
  }

  team.igl = newCaptainId;

  await team.save();

  const updatedTeam = await populateTeam(Team.findById(team._id));

  return updatedTeam;
};
const getMyTeam = async (currentUser) => {
  const team = await populateTeam(
    Team.findOne({
      players: currentUser._id,
    }),
  );

  return team;
};

module.exports = {
  createTeam,
  joinTeam,
  getAllTeams,
  getTeamById,
  getMyTeam,
  leaveTeam,
  removePlayerFromTeam,
  transferCaptain,
};
