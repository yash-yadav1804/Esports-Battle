const bcrypt = require("bcryptjs");

const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");

const sanitizeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    ign: user.ign,
    bgmiUID: user.bgmiUID,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const registerUser = async (userData) => {
  const { name, email, password, ign, bgmiUID, role } = userData;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    ign: ign?.trim() || "",
    bgmiUID: bgmiUID?.trim() || "",
    role: role || "player",
  });

  const token = generateToken(user._id);

  return {
    token,
    user: sanitizeUser(user),
  };
};

const loginUser = async (loginData) => {
  const { email, password } = loginData;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);

  return {
    token,
    user: sanitizeUser(user),
  };
};

module.exports = {
  registerUser,
  loginUser,
};
