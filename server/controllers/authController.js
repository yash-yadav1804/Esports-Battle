const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const authService = require("../services/authService");

const registerUser = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, result, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  res
    .status(200)
    .json(new ApiResponse(200, result, "User logged in successfully"));
});

module.exports = {
  registerUser,
  loginUser,
};
