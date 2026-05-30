const express = require("express");

const router = express.Router();

const { registerUser } = require("../controllers/authController");

router.post("/register", registerUser);

router.post("/login", (req, res) => {
  res.json({
    message: "Login Route Working",
  });
});

module.exports = router;
