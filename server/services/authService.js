const bcrypt = require("bcryptjs");

const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");
const { ROLES } = require("../constants/roles");

const nameRegex = /^[a-zA-Z ]{2,50}$/;
const bgmiUIDRegex = /^[0-9]{8,12}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

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
  const { name, email, password, ign, bgmiUID } = userData;

  if (!name || !email || !password || !ign || !bgmiUID) {
    throw new ApiError(
      400,
      "Name, email, password, IGN and BGMI UID are required",
    );
  }

  if (!nameRegex.test(name.trim())) {
    throw new ApiError(400, "Name should contain only letters and spaces");
  }

  if (!passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters and include one letter and one number",
    );
  }

  if (!bgmiUIDRegex.test(bgmiUID.trim())) {
    throw new ApiError(400, "BGMI UID must be 8 to 12 digits");
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
    ign: ign.trim(),
    bgmiUID: bgmiUID.trim(),
    role: ROLES.PLAYER,
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
