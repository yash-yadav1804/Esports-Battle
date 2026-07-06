const asyncHandler = require("../utils/asyncHandler");
const matchRoomService = require("../services/matchRoomService");

const createMatchRoom = asyncHandler(async (req, res) => {
  const matchRoom = await matchRoomService.createMatchRoom(
    req.params.tournamentId,
    req.body,
    req.user,
  );

  res.status(201).json({
    message: "Match room created successfully",
    matchRoom,
  });
});

const getAllMatchRooms = asyncHandler(async (req, res) => {
  const matchRooms = await matchRoomService.getAllMatchRooms();

  res.status(200).json({
    count: matchRooms.length,
    matchRooms,
  });
});

const getMyCreatedMatchRooms = asyncHandler(async (req, res) => {
  const matchRooms = await matchRoomService.getMyCreatedMatchRooms(req.user);

  res.status(200).json({
    count: matchRooms.length,
    matchRooms,
  });
});

const getMatchRoomById = asyncHandler(async (req, res) => {
  const matchRoom = await matchRoomService.getMatchRoomById(
    req.params.matchRoomId,
  );

  res.status(200).json({
    matchRoom,
  });
});

const updateMatchRoom = asyncHandler(async (req, res) => {
  const matchRoom = await matchRoomService.updateMatchRoom(
    req.params.matchRoomId,
    req.body,
    req.user,
  );

  res.status(200).json({
    message: "Match room updated successfully",
    matchRoom,
  });
});

const deleteMatchRoom = asyncHandler(async (req, res) => {
  await matchRoomService.deleteMatchRoom(req.params.matchRoomId, req.user);

  res.status(200).json({
    message: "Match room deleted successfully",
  });
});

module.exports = {
  createMatchRoom,
  getAllMatchRooms,
  getMyCreatedMatchRooms,
  getMatchRoomById,
  updateMatchRoom,
  deleteMatchRoom,
};
