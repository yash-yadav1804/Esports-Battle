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
const tournamentRoutes = require("./routes/tournamentRoutes");
const matchRoomRoutes = require("./routes/matchRoomRoutes");
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
// app.use("/api/matchrooms", matchRoomRoutes);
// Test Route

app.get("/", (req, res) => {
  res.send("Esports API Running");
});

module.exports = app;
