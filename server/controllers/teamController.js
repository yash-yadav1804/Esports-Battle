const Team = require("../models/Team");

const createTeam = async (req, res) => {
  try {
    const { teamName } = req.body;

    if (!teamName) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    const existingTeam = await Team.findOne({
      teamName: teamName.toLowerCase(),
    });

    if (existingTeam) {
      return res.status(400).json({
        message: "Team name already exists",
      });
    }

    const team = await Team.create({
      teamName: teamName.toLowerCase(),
      igl: req.user._id,
      players: [req.user._id],
    });
    res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const joinTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    const existingTeam = await Team.findOne({
      players: req.user._id,
    });

    if (existingTeam) {
      return res.status(400).json({
        message: "You are already in a team",
      });
    }
    if (team.players.length >= 4) {
      return res.status(400).json({
        message: "Team is full",
      });
    }

    team.players.push(req.user._id);

    await team.save();

    res.status(200).json({
      message: "Joined team successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      players: req.user._id,
    });

    if (!team) {
      return res.status(404).json({
        message: "You are not in any team",
      });
    }

    if (team.igl.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message:
          "IGL cannot leave team directly. Transfer captain or delete team.",
      });
    }

    team.players.pull(req.user._id);

    await team.save();

    res.status(200).json({
      message: "You left the team successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const removePlayerFromTeam = async (req, res) => {
  try {
    const { playerId } = req.params;

    const team = await Team.findOne({
      igl: req.user._id,
    });

    if (!team) {
      return res.status(404).json({
        message: "Only IGL can remove players",
      });
    }

    if (playerId === req.user._id.toString()) {
      return res.status(400).json({
        message: "IGL cannot remove himself",
      });
    }

    const playerExists = team.players.some(
      (player) => player.toString() === playerId,
    );

    if (!playerExists) {
      return res.status(404).json({
        message: "Player is not in your team",
      });
    }

    team.players.pull(playerId);

    await team.save();

    res.status(200).json({
      message: "Player removed from team successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const transferCaptain = async (req, res) => {
  try {
    const { newCaptainId } = req.params;

    const team = await Team.findOne({
      igl: req.user._id,
    });

    if (!team) {
      return res.status(403).json({
        message: "Only IGL can transfer captaincy",
      });
    }

    if (newCaptainId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You are already the IGL",
      });
    }

    const isTeamMember = team.players.some(
      (playerId) => playerId.toString() === newCaptainId,
    );

    if (!isTeamMember) {
      return res.status(400).json({
        message: "New captain must be a team member",
      });
    }

    team.igl = newCaptainId;

    await team.save();

    res.status(200).json({
      message: "Captain transferred successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  createTeam,
  joinTeam,
  getAllTeams,
  getTeamById,
  leaveTeam,
  removePlayerFromTeam,
  transferCaptain,
};
