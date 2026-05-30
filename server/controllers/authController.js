const User = require("../models/User");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  try {
    // Get data sent from Postman / Frontend
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Convert plain password into hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Send success response
    res.status(201).json({
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
};
