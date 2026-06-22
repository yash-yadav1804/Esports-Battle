const User = require("../models/User");
const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const MatchResult = require("../models/MatchResult");

const getMyProfile = async (req, res) => {
  try {
    res.status(200).json({
      message: "Profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      players: req.user._id,
    })
      .populate("igl", "name email ign bgmiUID")
      .populate("players", "name email ign bgmiUID");

    if (!team) {
      return res.status(404).json({
        message: "You are not in any team",
        team: null,
      });
    }

    res.status(200).json({
      message: "Team fetched successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyTournaments = async (req, res) => {
  try {
    const team = await Team.findOne({
      players: req.user._id,
    });

    if (!team) {
      return res.status(404).json({
        message: "You are not in any team",
        tournaments: [],
      });
    }

    const tournaments = await Tournament.find({
      registeredTeams: team._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "My tournaments fetched successfully",
      count: tournaments.length,
      tournaments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyMatchHistory = async (req, res) => {
  try {
    const team = await Team.findOne({
      players: req.user._id,
    });

    if (!team) {
      return res.status(404).json({
        message: "You are not in any team",
        matchHistory: [],
      });
    }

    const matchHistory = await MatchResult.find({
      team: team._id,
    })
      .populate("tournament", "title game mode status")
      .populate("matchRoom", "roomId matchNumber status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Match history fetched successfully",
      count: matchHistory.length,
      matchHistory,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, ign, bgmiUID } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (bgmiUID !== undefined && bgmiUID !== user.bgmiUID) {
      const existingUser = await User.findOne({
        bgmiUID,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "BGMI UID already exists",
        });
      }

      user.bgmiUID = bgmiUID;
    }

    if (name !== undefined) user.name = name;
    if (ign !== undefined) user.ign = ign;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        ign: user.ign,
        bgmiUID: user.bgmiUID,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  getMyTeam,
  getMyTournaments,
  getMyMatchHistory,
  updateMyProfile,
};
