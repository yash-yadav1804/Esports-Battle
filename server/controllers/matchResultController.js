const MatchResult = require("../models/MatchResult");

const addMatchResult = async (req, res) => {
  try {
    const { team, tournament, matchRoom, kills, position } = req.body;

    let placementPoints = 0;

    if (position === 1) placementPoints = 15;
    else if (position === 2) placementPoints = 12;
    else if (position === 3) placementPoints = 10;
    else if (position === 4) placementPoints = 8;
    else if (position === 5) placementPoints = 6;

    // Kill points
    const killPoints = kills * 2;

    // Total points
    const totalPoints = killPoints + placementPoints;

    // Save result
    const result = await MatchResult.create({
      team,
      tournament,
      matchRoom,
      kills,
      position,
      killPoints,
      placementPoints,
      totalPoints,
    });

    res.status(201).json({
      message: "Match result added successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getAllMatchResults = async (req, res) => {
  try {
    const results = await MatchResult.find()
      .populate("team", "teamName")
      .populate("tournament", "title")
      .populate("matchRoom", "roomId");

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addMatchResult,
  getAllMatchResults,
};
