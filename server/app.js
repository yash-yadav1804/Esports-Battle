const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const helmet = require("helmet");
const cors = require("cors");

const corsOptions = require("./config/corsOptions");
const sanitizeMongoInput = require("./middleware/sanitizeMongoInput");
const { apiLimiter, authLimiter } = require("./middleware/rateLimitMiddleware");

const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const profileRoutes = require("./routes/profileRoutes");
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
const adminRoutes = require("./routes/adminRoutes");
const resultSubmissionRoutes = require("./routes/resultSubmissionRoutes");
const organizerRequestRoutes = require("./routes/organizerRequestRoutes");

const ApiResponse = require("./utils/ApiResponse");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

/* Security + core middlewares */
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());

app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(sanitizeMongoInput);

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

/* Health route */
app.get("/", (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, null, "Esports API Running Successfully"));
});

/* API routes */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matchrooms", matchRoomRoutes);
app.use("/api/matchregistrations", matchRegistrationRoutes);
app.use("/api/matchresults", matchResultsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/winner", winnerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/team-requests", teamRequestRoutes);
app.use("/api/prizes", prizeRoutes);
app.use("/api/result-submissions", resultSubmissionRoutes);
app.use("/api/organizer-requests", organizerRequestRoutes);

/* Error middlewares must be after all routes */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
