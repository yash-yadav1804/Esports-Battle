const Notification = require("../models/Notification");
const TeamRequest = require("../models/TeamRequest");
const Team = require("../models/Team");

// Send Join Request
const sendRequest = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Step 1: Find team first
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Step 2: Captain/IGL should not send request to own team
    if (team.igl.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Captain is already in the team",
      });
    }

    // Step 3: Check user already in this team or not
    const isAlreadyMember = team.players.some(
      (playerId) => playerId.toString() === req.user._id.toString(),
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        message: "You are already a team member",
      });
    }

    // Step 4: Check team full or not
    if (team.players.length >= team.maxPlayers) {
      return res.status(400).json({
        message: "Team is full",
      });
    }

    // Step 5: Check pending request already exists or not
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

    // Step 6: Create join request
    const request = await TeamRequest.create({
      team: teamId,
      player: req.user._id,
    });

    // Step 7: Notify IGL
    await Notification.create({
      user: team.igl,
      title: "New Team Request",
      message: `${req.user.name} wants to join your team ${team.teamName}`,
      type: "team_request",
    });

    res.status(201).json({
      message: "Join request sent successfully",
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

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Only IGL can view requests of his team
    if (team.igl.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only IGL can view team requests",
      });
    }

    const requests = await TeamRequest.find({
      team: teamId,
      status: "pending",
    })
      .populate("player", "name email ign bgmiUID")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Approve Join Request
const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await TeamRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request already ${request.status}`,
      });
    }

    const team = await Team.findById(request.team);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Only team IGL can approve request
    if (team.igl.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only IGL can approve requests",
      });
    }

    // Check team full
    if (team.players.length >= team.maxPlayers) {
      return res.status(400).json({
        message: "Team is full",
      });
    }

    // Check player already exists in team
    const isAlreadyMember = team.players.some(
      (playerId) => playerId.toString() === request.player.toString(),
    );

    if (isAlreadyMember) {
      request.status = "accepted";
      await request.save();

      return res.status(400).json({
        message: "Player is already in the team",
      });
    }

    // Add player to team
    team.players.push(request.player);
    await team.save();

    // Update request status
    request.status = "accepted";
    await request.save();

    // Notify player
    await Notification.create({
      user: request.player,
      title: "Team Request Approved",
      message: `Your request to join team ${team.teamName} has been approved.`,
      type: "team_request",
    });

    res.status(200).json({
      message: "Player added to team successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Reject Join Request
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await TeamRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request already ${request.status}`,
      });
    }

    const team = await Team.findById(request.team);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Only team IGL can reject request
    if (team.igl.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only IGL can reject requests",
      });
    }

    request.status = "rejected";
    await request.save();

    // Notify player
    await Notification.create({
      user: request.player,
      title: "Team Request Rejected",
      message: `Your request to join team ${team.teamName} has been rejected.`,
      type: "team_request",
    });

    res.status(200).json({
      message: "Request rejected successfully",
      request,
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
  rejectRequest,
};
