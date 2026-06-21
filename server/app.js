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
const matchRegistrationRoutes = require("./routes/matchRegistrationRoutes");
const matchResultsRoutes = require("./routes/matchResultsRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const winnerRoutes = require("./routes/winnerRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const teamRequestRoutes = require("./routes/teamRequestRoutes");
const prizeRoutes = require("./routes/prizeRoutes");
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matchrooms", matchRoomRoutes);
app.use("/api/matchregistrations", matchRegistrationRoutes);
app.use("/api/matchresults", matchResultsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/winner", winnerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/team-requests", teamRequestRoutes);
app.use("/api/prizes", prizeRoutes);
// Test Route

app.get("/", (req, res) => {
  res.send("Esports API Running");
});

module.exports = app;
