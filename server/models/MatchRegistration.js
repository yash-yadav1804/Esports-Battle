const mongoose = require("mongoose");

const matchRegistrationSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    matchRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MatchRoom",
      required: true,
    },

    bgmiName: {
      type: String,
      required: true,
    },

    bgmiId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);
matchRegistrationSchema.index(
  {
    player: 1,
    matchRoom: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("MatchRegistration", matchRegistrationSchema);
