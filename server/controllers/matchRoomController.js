const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const matchRoomService = require("../services/matchRoomService");

const createMatchRoom = asyncHandler(async (req, res) => {
  const room = await matchRoomService.createMatchRoom(
    req.params.tournamentId,
    req.body,
    req.user,
  );

  res.status(201).json({
    message: "Match room created successfully",
    room,
  });
});

const getAllMatchRooms = asyncHandler(async (req, res) => {
  const rooms = await matchRoomService.getAllMatchRooms();

  res.status(200).json(rooms);
});

const getMyCreatedMatchRooms = asyncHandler(async (req, res) => {
  const rooms = await matchRoomService.getMyCreatedMatchRooms(req.user);

  res
    .status(200)
    .json(
      new ApiResponse(200, rooms, "Created match rooms fetched successfully"),
    );
});

module.exports = {
  createMatchRoom,
  getAllMatchRooms,
  getMyCreatedMatchRooms,
};
