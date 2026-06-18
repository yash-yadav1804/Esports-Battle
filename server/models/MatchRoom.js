const mongoose = require("mongoose");

const matchRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: Number,
      required: true,
      unique: true,
    },

    roomPassword: {
      type: String,
      required: true,
    },

    matchNumber: {
      type: Number,
      required: true,
      default: 1,
    },

    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
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
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MatchRoom", matchRoomSchema);
