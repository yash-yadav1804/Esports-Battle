const TeamRequest = require("../models/TeamRequest");
const Team = require("../models/Team");

// Send Join Request
const sendRequest = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    if (team.igl.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Captain is already in the team",
      });
    }

    if (team.players.includes(req.user._id)) {
      return res.status(400).json({
        message: "You are already a team member",
      });
    }

    const existingRequest = await TeamRequest.findOne({
      team: teamId,
      player: req.user._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Request already sent",
      });
    }

    const request = await TeamRequest.create({
      team: teamId,
      player: req.user._id,
    });

    res.status(201).json({
      message: "Join request sent",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// View Team Requests
const getTeamRequests = async (req, res) => {
  try {
    const { teamId } = req.params;

    const requests = await TeamRequest.find({
      team: teamId,
      status: "pending",
    }).populate("player", "name email ign");

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await TeamRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    const team = await Team.findById(request.team);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    if (team.players.length >= team.maxPlayers) {
      return res.status(400).json({
        message: "Team is full",
      });
    }

    team.players.push(request.player);

    await team.save();

    request.status = "accepted";

    await request.save();

    res.status(200).json({
      message: "Player added to team successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  sendRequest,
  getTeamRequests,
  approveRequest,
};
