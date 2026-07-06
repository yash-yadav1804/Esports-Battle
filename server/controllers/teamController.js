const asyncHandler = require("../utils/asyncHandler");
const teamService = require("../services/teamService");

const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(req.body, req.user);

  res.status(201).json({
    message: "Team created successfully",
    team,
  });
});

const joinTeam = asyncHandler(async (req, res) => {
  const team = await teamService.joinTeam(req.params.teamId, req.user);

  res.status(200).json({
    message: "Team joined successfully",
    team,
  });
});

const getAllTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.getAllTeams();

  res.status(200).json({
    count: teams.length,
    teams,
  });
});

const getTeamById = asyncHandler(async (req, res) => {
  const team = await teamService.getTeamById(req.params.teamId);

  res.status(200).json({
    team,
  });
});

const leaveTeam = asyncHandler(async (req, res) => {
  const result = await teamService.leaveTeam(req.user);

  res.status(200).json({
    message: result.teamDeleted
      ? "You left the team. Team deleted because no players remained."
      : "You left the team successfully",
    team: result.team,
  });
});

const removePlayerFromTeam = asyncHandler(async (req, res) => {
  const team = await teamService.removePlayerFromTeam(
    req.params.playerId,
    req.user,
  );

  res.status(200).json({
    message: "Player removed from team successfully",
    team,
  });
});

const transferCaptain = asyncHandler(async (req, res) => {
  const team = await teamService.transferCaptain(
    req.params.newCaptainId,
    req.user,
  );

  res.status(200).json({
    message: "Captaincy transferred successfully",
    team,
  });
});
const getMyTeam = asyncHandler(async (req, res) => {
  const team = await teamService.getMyTeam(req.user);

  res.status(200).json({
    team,
  });
});
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
