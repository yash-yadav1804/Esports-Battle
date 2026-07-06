import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

import Teams from "./pages/Teams";
import MyTeam from "./pages/MyTeam";
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
import ManageUsers from "./pages/ManageUsers";
import ManageTeams from "./pages/ManageTeams";
import ManageMatchRooms from "./pages/ManageMatchRooms";
import TournamentHistory from "./pages/TournamentHistory";
import OrganizerApplication from "./pages/OrganizerApplication";
import AdminOrganizerRequests from "./pages/AdminOrganizerRequests";
import RoleRoute from "./routes/RoleRoute";

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
          path="/history"
          element={
            <ProtectedRoute>
              <TournamentHistory />
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
          path="/my-team"
          element={
            <ProtectedRoute>
              <MyTeam />
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
          path="/match-rooms/manage"
          element={
            <RoleRoute allowedRoles={["organizer", "admin", "superAdmin"]}>
              <ManageMatchRooms />
            </RoleRoute>
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
          path="/admin/manage-users"
          element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage-teams"
          element={
            <AdminRoute>
              <ManageTeams />
            </AdminRoute>
          }
        />

        <Route
          path="/tournaments/create"
          element={
            <RoleRoute allowedRoles={["organizer", "admin", "superAdmin"]}>
              <CreateTournament />
            </RoleRoute>
          }
        />

        <Route
          path="/tournaments/manage"
          element={
            <RoleRoute allowedRoles={["organizer", "admin", "superAdmin"]}>
              <ManageTournaments />
            </RoleRoute>
          }
        />

        <Route
          path="/match-rooms/create"
          element={
            <RoleRoute allowedRoles={["organizer", "admin", "superAdmin"]}>
              <CreateMatchRoom />
            </RoleRoute>
          }
        />

        <Route
          path="/results/pending"
          element={
            <RoleRoute allowedRoles={["organizer", "admin", "superAdmin"]}>
              <PendingResults />
            </RoleRoute>
          }
        />
        <Route
          path="/organizer/apply"
          element={
            <ProtectedRoute>
              <OrganizerApplication />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/organizer-requests"
          element={
            <AdminRoute>
              <AdminOrganizerRequests />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/tournaments" replace />} />
      </Routes>
    </>
  );
};

export default App;
