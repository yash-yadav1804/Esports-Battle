const mongoose = require("mongoose");

const matchResultSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    matchRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MatchRoom",
      required: true,
    },
    kills: {
      type: Number,
      required: true,
      default: 0,
    },
    position: {
      type: Number,
      required: true,
    },
    killPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    placementPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MatchResult", matchResultSchema);
