const MatchRoom = require("../models/MatchRoom");
const Tournament = require("../models/Tournament");

const createMatchRoom = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const { roomId, roomPassword, matchNumber } = req.body;

    // Required fields validation
    if (!roomId || !roomPassword) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // Find tournament
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    // Tournament validation
    if (tournament.status === "completed") {
      return res.status(400).json({
        message: "Tournament already completed",
      });
    }

    // Check room already exists
    const existingRoom = await MatchRoom.findOne({
      roomId,
    });

    if (existingRoom) {
      return res.status(400).json({
        message: "Room ID already exists",
      });
    }

    // Create room
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

module.exports = {
  createMatchRoom,
};
