const express = require("express");

const { registerUser, loginUser } = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const {
  registerUserSchema,
  loginUserSchema,
} = require("../validators/authValidator");

const router = express.Router();

router.post("/register", validateRequest(registerUserSchema), registerUser);

router.post("/login", validateRequest(loginUserSchema), loginUser);

module.exports = router;
