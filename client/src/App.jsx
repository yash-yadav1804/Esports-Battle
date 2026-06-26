import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import AdminDashboard from "./pages/AdminDashboard";
import CreateTournament from "./pages/CreateTournament";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import CreateTeam from "./pages/CreateTeam";
import Teams from "./pages/Teams";
import TeamRequests from "./pages/TeamRequests";
import Notifications from "./pages/Notifications";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/tournaments"
          element={
            <ProtectedRoute>
              <Tournaments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tournaments/:tournamentId"
          element={
            <ProtectedRoute>
              <TournamentDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaderboard/:tournamentId"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams/create"
          element={
            <ProtectedRoute>
              <CreateTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-requests"
          element={
            <ProtectedRoute>
              <TeamRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/create-tournament"
          element={
            <AdminRoute>
              <CreateTournament />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
