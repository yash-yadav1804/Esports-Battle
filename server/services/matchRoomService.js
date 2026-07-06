const MatchRoom = require("../models/MatchRoom");
const Tournament = require("../models/Tournament");

const ApiError = require("../utils/ApiError");
const { ROLES } = require("../constants/roles");

const isPlatformAdmin = (user) => {
  return user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;
};

const isTournamentOwner = (tournament, user) => {
  if (!tournament.createdBy) return false;

  return tournament.createdBy.toString() === user._id.toString();
};

const ensureCanManageTournament = (tournament, currentUser) => {
  if (isPlatformAdmin(currentUser)) return;

  if (
    currentUser.role === ROLES.ORGANIZER &&
    isTournamentOwner(tournament, currentUser)
  ) {
    return;
  }

  throw new ApiError(
    403,
    "You can manage match rooms only for your own tournaments",
  );
};

const populateMatchRoom = (query) => {
  return query
    .populate("tournament", "title game mode status createdBy")
    .populate("createdBy", "name email role");
};

const createMatchRoom = async (tournamentId, roomData, currentUser) => {
  const { matchNumber, map, roomId, roomPassword, matchTime } = roomData;

  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  ensureCanManageTournament(tournament, currentUser);

  if (tournament.status === "completed") {
    throw new ApiError(
      400,
      "Cannot create match room for completed tournament",
    );
  }

  const existingRoomId = await MatchRoom.findOne({
    roomId,
  });

  if (existingRoomId) {
    throw new ApiError(400, "Room ID already exists");
  }

  const existingMatchNumber = await MatchRoom.findOne({
    tournament: tournamentId,
    matchNumber,
  });

  if (existingMatchNumber) {
    throw new ApiError(400, "Match number already exists for this tournament");
  }

  const matchRoom = await MatchRoom.create({
    tournament: tournamentId,
    matchNumber,
    map,
    roomId,
    roomPassword,
    matchTime,
    createdBy: currentUser._id,
  });

  return populateMatchRoom(MatchRoom.findById(matchRoom._id));
};
const getAllMatchRooms = async () => {
  const matchRooms = await populateMatchRoom(
    MatchRoom.find().select("-roomPassword").sort({ createdAt: -1 }),
  );

  return matchRooms;
};

const getMyCreatedMatchRooms = async (currentUser) => {
  if (isPlatformAdmin(currentUser)) {
    const matchRooms = await populateMatchRoom(
      MatchRoom.find().sort({ createdAt: -1 }),
    );

    return matchRooms;
  }

  const matchRooms = await populateMatchRoom(
    MatchRoom.find({
      createdBy: currentUser._id,
    }).sort({ createdAt: -1 }),
  );

  return matchRooms;
};

const getMatchRoomById = async (matchRoomId) => {
  const matchRoom = await populateMatchRoom(MatchRoom.findById(matchRoomId));

  if (!matchRoom) {
    throw new ApiError(404, "Match room not found");
  }

  return matchRoom;
};

const updateMatchRoom = async (matchRoomId, updateData, currentUser) => {
  const matchRoom = await MatchRoom.findById(matchRoomId);

  if (!matchRoom) {
    throw new ApiError(404, "Match room not found");
  }

  const tournament = await Tournament.findById(matchRoom.tournament);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  ensureCanManageTournament(tournament, currentUser);

  if (tournament.status === "completed") {
    throw new ApiError(
      400,
      "Cannot update match room for completed tournament",
    );
  }

  if (updateData.roomId !== undefined) {
    const existingRoom = await MatchRoom.findOne({
      roomId: updateData.roomId,
      _id: { $ne: matchRoomId },
    });

    if (existingRoom) {
      throw new ApiError(400, "Room ID already exists");
    }

    matchRoom.roomId = updateData.roomId;
  }

  if (updateData.matchNumber !== undefined) {
    const existingMatchNumber = await MatchRoom.findOne({
      tournament: matchRoom.tournament,
      matchNumber: updateData.matchNumber,
      _id: { $ne: matchRoomId },
    });

    if (existingMatchNumber) {
      throw new ApiError(
        400,
        "Match number already exists for this tournament",
      );
    }

    matchRoom.matchNumber = updateData.matchNumber;
  }

  if (updateData.map !== undefined) {
    matchRoom.map = updateData.map;
  }

  if (updateData.roomPassword !== undefined) {
    matchRoom.roomPassword = updateData.roomPassword;
  }

  if (updateData.matchTime !== undefined) {
    matchRoom.matchTime = updateData.matchTime;
  }

  await matchRoom.save();

  return populateMatchRoom(MatchRoom.findById(matchRoom._id));
};

const deleteMatchRoom = async (matchRoomId, currentUser) => {
  const matchRoom = await MatchRoom.findById(matchRoomId);

  if (!matchRoom) {
    throw new ApiError(404, "Match room not found");
  }

  const tournament = await Tournament.findById(matchRoom.tournament);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  ensureCanManageTournament(tournament, currentUser);

  if (tournament.status === "completed") {
    throw new ApiError(
      400,
      "Cannot delete match room for completed tournament",
    );
  }

  await matchRoom.deleteOne();

  return matchRoom;
};

module.exports = {
  createMatchRoom,
  getAllMatchRooms,
  getMyCreatedMatchRooms,
  getMatchRoomById,
  updateMatchRoom,
  deleteMatchRoom,
};
