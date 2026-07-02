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
      trim: true,
    },

    matchNumber: {
      type: Number,
      required: true,
      default: 1,
    },

    map: {
      type: String,
      enum: ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik", "Karakin"],
      default: "Erangel",
    },

    matchTime: {
      type: Date,
      required: true,
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
