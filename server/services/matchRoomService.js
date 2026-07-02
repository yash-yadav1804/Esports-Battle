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

const ensureCanManageTournament = (tournament, user) => {
  if (isPlatformAdmin(user)) return;

  if (user.role === ROLES.ORGANIZER && isTournamentOwner(tournament, user)) {
    return;
  }

  throw new ApiError(
    403,
    "You can create match rooms only for your own tournaments",
  );
};

const createMatchRoom = async (tournamentId, roomData, currentUser) => {
  const { roomId, roomPassword, matchNumber, map, matchTime } = roomData;

  if (!roomId || !roomPassword || !matchTime) {
    throw new ApiError(
      400,
      "Room ID, room password and match time are required",
    );
  }

  if (Number.isNaN(Number(roomId))) {
    throw new ApiError(400, "Room ID must be a number");
  }

  if (matchNumber !== undefined && Number.isNaN(Number(matchNumber))) {
    throw new ApiError(400, "Match number must be a number");
  }

  if (matchNumber !== undefined && Number(matchNumber) <= 0) {
    throw new ApiError(400, "Match number must be greater than 0");
  }

  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  ensureCanManageTournament(tournament, currentUser);

  if (tournament.status === "completed") {
    throw new ApiError(400, "Tournament already completed");
  }

  const existingRoom = await MatchRoom.findOne({
    roomId: Number(roomId),
  });

  if (existingRoom) {
    throw new ApiError(400, "Room ID already exists");
  }

  const room = await MatchRoom.create({
    roomId: Number(roomId),
    roomPassword: roomPassword.trim(),
    matchNumber: Number(matchNumber) || 1,
    map: map || "Erangel",
    matchTime,
    tournament: tournament._id,
    createdBy: currentUser._id,
  });

  return room;
};

const getAllMatchRooms = async () => {
  const rooms = await MatchRoom.find()
    .populate("tournament", "title game mode status createdBy")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  return rooms;
};

const getMyCreatedMatchRooms = async (currentUser) => {
  const query = isPlatformAdmin(currentUser)
    ? {}
    : {
        createdBy: currentUser._id,
      };

  const rooms = await MatchRoom.find(query)
    .populate("tournament", "title game mode status createdBy")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  return rooms;
};

module.exports = {
  createMatchRoom,
  getAllMatchRooms,
  getMyCreatedMatchRooms,
};
