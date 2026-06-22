const ResultSubmission = require("../models/ResultSubmission");
const MatchResult = require("../models/MatchResult");
const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const MatchRoom = require("../models/MatchRoom");

const submitResult = async (req, res) => {
  try {
    const { tournamentId, matchRoomId, kills, position } = req.body;

    if (!tournamentId || !matchRoomId || kills === undefined || !position) {
      return res.status(400).json({
        message: "Please provide tournamentId, matchRoomId, kills and position",
      });
    }

    const team = await Team.findOne({
      players: req.user._id,
    });

    if (!team) {
      return res.status(400).json({
        message: "You are not in any team",
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
        message: "Cannot submit result for completed tournament",
      });
    }

    const matchRoom = await MatchRoom.findById(matchRoomId);

    if (!matchRoom) {
      return res.status(404).json({
        message: "Match room not found",
      });
    }

    if (matchRoom.tournament.toString() !== tournamentId) {
      return res.status(400).json({
        message: "Match room does not belong to this tournament",
      });
    }

    const isRegistered = tournament.registeredTeams.some(
      (teamId) => teamId.toString() === team._id.toString(),
    );

    if (!isRegistered) {
      return res.status(400).json({
        message: "Your team is not registered in this tournament",
      });
    }

    const existingSubmission = await ResultSubmission.findOne({
      team: team._id,
      matchRoom: matchRoomId,
      status: "pending",
    });

    if (existingSubmission) {
      return res.status(400).json({
        message: "Result submission already pending for this match",
      });
    }

    const existingResult = await MatchResult.findOne({
      team: team._id,
      matchRoom: matchRoomId,
    });

    if (existingResult) {
      return res.status(400).json({
        message: "Result already approved for this match",
      });
    }

    const submission = await ResultSubmission.create({
      team: team._id,
      tournament: tournamentId,
      matchRoom: matchRoomId,
      submittedBy: req.user._id,
      kills,
      position,
    });

    res.status(201).json({
      message: "Result submitted successfully. Waiting for admin approval.",
      submission,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await ResultSubmission.find({
      status: "pending",
    })
      .populate("team", "teamName")
      .populate("tournament", "title game")
      .populate("matchRoom", "roomId matchNumber")
      .populate("submittedBy", "name email ign bgmiUID")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const approveSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await ResultSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({
        message: `Submission already ${submission.status}`,
      });
    }

    const existingResult = await MatchResult.findOne({
      team: submission.team,
      matchRoom: submission.matchRoom,
    });

    if (existingResult) {
      submission.status = "approved";
      await submission.save();

      return res.status(400).json({
        message: "Match result already exists for this team and match room",
      });
    }

    let placementPoints = 0;

    if (submission.position === 1) placementPoints = 15;
    else if (submission.position === 2) placementPoints = 12;
    else if (submission.position === 3) placementPoints = 10;
    else if (submission.position === 4) placementPoints = 8;
    else if (submission.position === 5) placementPoints = 6;

    const killPoints = submission.kills * 2;
    const totalPoints = killPoints + placementPoints;

    const matchResult = await MatchResult.create({
      team: submission.team,
      tournament: submission.tournament,
      matchRoom: submission.matchRoom,
      kills: submission.kills,
      position: submission.position,
      killPoints,
      placementPoints,
      totalPoints,
    });

    submission.status = "approved";
    await submission.save();

    res.status(200).json({
      message: "Submission approved and match result created successfully",
      matchResult,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const rejectSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { adminNote } = req.body || {};

    const submission = await ResultSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({
        message: `Submission already ${submission.status}`,
      });
    }

    submission.status = "rejected";
    submission.adminNote = adminNote || "Rejected by admin";

    await submission.save();

    res.status(200).json({
      message: "Submission rejected successfully",
      submission,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await ResultSubmission.find({
      submittedBy: req.user._id,
    })
      .populate("team", "teamName")
      .populate("tournament", "title game")
      .populate("matchRoom", "roomId matchNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  submitResult,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  getMySubmissions,
};
