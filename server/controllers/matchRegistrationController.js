const MatchRegistration = require("../models/MatchRegistration");
const MatchRoom = require("../models/MatchRoom");
const Team = require("../models/Team");

const joinMatchRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Check room exists
    const room = await MatchRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Match room not found",
      });
    }

    // Check player team
    const team = await Team.findOne({
      players: req.user._id,
    });

    if (!team) {
      return res.status(400).json({
        message: "You are not in any team",
      });
    }

    // Check already joined
    const existingRegistration = await MatchRegistration.findOne({
      player: req.user._id,
      matchRoom: room._id,
    });

    if (existingRegistration) {
      return res.status(400).json({
        message: "Already joined this match room",
      });
    }

    // Create registration
    const registration = await MatchRegistration.create({
      player: req.user._id,
      team: team._id,
      matchRoom: room._id,
      bgmiName: req.user.ign,
      bgmiId: req.user.bgmiUID,
      status: "joined",
    });

    res.status(201).json({
      message: "Joined match room successfully",
      registration,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  joinMatchRoom,
};
