const MatchRoom = require("../models/MatchRoom");
const Tournament = require("../models/Tournament");

const createMatchRoom = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { roomId, roomPassword, matchNumber } = req.body;

    if (!roomId || !roomPassword) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (tournament.status === "completed") {
      return res.status(400).json({
        message: "Tournament already completed",
      });
    }

    const existingRoom = await MatchRoom.findOne({ roomId });

    if (existingRoom) {
      return res.status(400).json({
        message: "Room ID already exists",
      });
    }

    const room = await MatchRoom.create({
      roomId,
      roomPassword,
      matchNumber,
      tournament: tournament._id,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Match room created successfully",
      room,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllMatchRooms = async (req, res) => {
  try {
    const rooms = await MatchRoom.find()
      .populate("tournament", "title game")
      .populate("createdBy", "name");

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createMatchRoom,
  getAllMatchRooms,
};
