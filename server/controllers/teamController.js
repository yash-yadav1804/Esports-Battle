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
    console.log("Received Team ID:", teamId);

    const team = await Team.findById(teamId);
    console.log("Found Team:", team);

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

module.exports = {
  createTeam,
  joinTeam,
};
