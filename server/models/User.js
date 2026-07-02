const mongoose = require("mongoose");
const { USER_ROLES, ROLES } = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    ign: {
      type: String,
    },
    bgmiUID: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["player", "admin"],
      default: "player",
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: ROLES.PLAYER,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
