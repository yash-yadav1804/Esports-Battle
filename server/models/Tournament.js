const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },

    game: {
      type: String,
      required: true,
      enum: ["BGMI", "PUBG", "FREE FIRE"],
    },

    mode: {
      type: String,
      required: true,
      enum: ["Solo", "Duo", "Squad"],
    },

    entryFee: {
      type: Number,
      required: true,
      default: 0,
    },

    prizePool: {
      type: Number,
      required: true,
      default: 0,
    },

    maxTeams: {
      type: Number,
      default: 25,
    },

    registeredTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],

    startDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["upcoming", "live", "completed"],
      default: "upcoming",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Tournament", tournamentSchema);
