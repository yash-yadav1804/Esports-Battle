import { useEffect, useState } from "react";
import API from "../api/axios";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/admin/dashboard-stats");
        setStats(res.data.stats);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch dashboard stats",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <h1>Loading admin dashboard...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1>Error</h1>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Users</h2>
          <p>Total Users: {stats.users.totalUsers}</p>
          <p>Players: {stats.users.totalPlayers}</p>
          <p>Admins: {stats.users.totalAdmins}</p>
        </div>

        <div className={styles.card}>
          <h2>Teams</h2>
          <p>Total Teams: {stats.teams.totalTeams}</p>
        </div>

        <div className={styles.card}>
          <h2>Tournaments</h2>
          <p>Total: {stats.tournaments.totalTournaments}</p>
          <p>Upcoming: {stats.tournaments.upcomingTournaments}</p>
          <p>Live: {stats.tournaments.liveTournaments}</p>
          <p>Completed: {stats.tournaments.completedTournaments}</p>
        </div>

        <div className={styles.card}>
          <h2>Matches</h2>
          <p>Match Rooms: {stats.matches.totalMatchRooms}</p>
          <p>Match Results: {stats.matches.totalMatchResults}</p>
        </div>

        <div className={styles.card}>
          <h2>Prizes</h2>
          <p>Total Prize Distributed: ₹{stats.prizes.totalPrizeDistributed}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
