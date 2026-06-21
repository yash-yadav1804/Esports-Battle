const mongoose = require("mongoose");

const prizeDistributionSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    firstPlace: {
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
      amount: Number,
    },

    secondPlace: {
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
      amount: Number,
    },

    thirdPlace: {
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
      amount: Number,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PrizeDistribution", prizeDistributionSchema);
