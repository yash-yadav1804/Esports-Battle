const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const tournamentService = require("../services/tournamentService");

const createTournament = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.createTournament(
    req.body,
    req.user,
  );

  res.status(201).json({
    message: "Tournament created successfully",
    tournament,
  });
});

const registerTeam = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.registerTeam(
    req.params.tournamentId,
    req.user,
  );

  res.status(200).json({
    message: "Team registered successfully",
    tournament,
  });
});

const getAllTournaments = asyncHandler(async (req, res) => {
  const tournaments = await tournamentService.getAllTournaments();

  res.status(200).json(tournaments);
});

const getMyCreatedTournaments = asyncHandler(async (req, res) => {
  const tournaments = await tournamentService.getMyCreatedTournaments(req.user);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        tournaments,
        "Manageable tournaments fetched successfully",
      ),
    );
});

const getTournamentById = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.getTournamentById(
    req.params.tournamentId,
  );

  res.status(200).json(tournament);
});

const updateTournament = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.updateTournament(
    req.params.tournamentId,
    req.body,
    req.user,
  );

  res.status(200).json({
    message: "Tournament updated successfully",
    tournament,
  });
});

const deleteTournament = asyncHandler(async (req, res) => {
  await tournamentService.deleteTournament(req.params.tournamentId, req.user);

  res.status(200).json({
    message: "Tournament and related data deleted successfully",
  });
});

const leaveTournament = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.leaveTournament(
    req.params.tournamentId,
    req.user,
  );

  res.status(200).json({
    message: "Left tournament successfully",
    tournament,
  });
});

const startTournament = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.startTournament(
    req.params.tournamentId,
    req.user,
  );

  res.status(200).json({
    message: "Tournament started successfully",
    tournament,
  });
});

const completeTournament = asyncHandler(async (req, res) => {
  const result = await tournamentService.completeTournament(
    req.params.tournamentId,
    req.user,
  );

  res.status(200).json({
    message: "Tournament completed successfully",
    winner: result.winner,
    prizePool: result.prizePool,
    tournament: result.tournament,
  });
});

const getTournamentHistory = asyncHandler(async (req, res) => {
  const history = await tournamentService.getTournamentHistory();

  res.status(200).json({
    count: history.length,
    history,
  });
});

module.exports = {
  createTournament,
  registerTeam,
  getAllTournaments,
  getMyCreatedTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  leaveTournament,
  startTournament,
  completeTournament,
  getTournamentHistory,
};
