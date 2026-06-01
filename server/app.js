const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const teamRoutes = require("./routes/teamRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("Esports API Running");
});

module.exports = app;
