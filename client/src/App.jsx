import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

import Teams from "./pages/Teams";
import CreateTeam from "./pages/CreateTeam";
import TeamRequests from "./pages/TeamRequests";

import MatchRooms from "./pages/MatchRooms";
import SubmitResult from "./pages/SubmitResult";
import MySubmissions from "./pages/MySubmissions";

import AdminDashboard from "./pages/AdminDashboard";
import CreateTournament from "./pages/CreateTournament";
import CreateMatchRoom from "./pages/CreateMatchRoom";
import PendingResults from "./pages/PendingResults";
import ManageTournaments from "./pages/ManageTournaments";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

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
          path="/tournament"
          element={<Navigate to="/tournaments" replace />}
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
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
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
          path="/teams/create"
          element={
            <ProtectedRoute>
              <CreateTeam />
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
          path="/match-rooms"
          element={
            <ProtectedRoute>
              <MatchRooms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/submit-result"
          element={
            <ProtectedRoute>
              <SubmitResult />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-submissions"
          element={
            <ProtectedRoute>
              <MySubmissions />
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

        <Route
          path="/admin/manage-tournaments"
          element={
            <AdminRoute>
              <ManageTournaments />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/create-match-room"
          element={
            <AdminRoute>
              <CreateMatchRoom />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/pending-results"
          element={
            <AdminRoute>
              <PendingResults />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/tournaments" replace />} />
      </Routes>
    </>
  );
};

export default App;
