import { useEffect, useState } from "react";
import API from "../api/axios";

import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

import styles from "./AdminDashboard.module.css";

const formatCurrency = (amount = 0) => {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/dashboard-stats");

        if (!isMounted) return;

        setStats(res.data.stats);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message || "Failed to fetch dashboard stats",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading admin dashboard"
          message="Fetching users, teams, tournaments, matches, and prize statistics."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load dashboard" message={error} />
      </main>
    );
  }

  const dashboardCards = [
    {
      label: "Total Users",
      value: stats?.users?.totalUsers || 0,
      meta: `${stats?.users?.totalPlayers || 0} players • ${
        stats?.users?.totalAdmins || 0
      } admins`,
      icon: "👥",
    },
    {
      label: "Total Teams",
      value: stats?.teams?.totalTeams || 0,
      meta: "Registered esports teams",
      icon: "🛡️",
    },
    {
      label: "Tournaments",
      value: stats?.tournaments?.totalTournaments || 0,
      meta: `${stats?.tournaments?.upcomingTournaments || 0} upcoming • ${
        stats?.tournaments?.liveTournaments || 0
      } live`,
      icon: "🏆",
    },
    {
      label: "Completed",
      value: stats?.tournaments?.completedTournaments || 0,
      meta: "Finished tournaments",
      icon: "✅",
    },
    {
      label: "Match Rooms",
      value: stats?.matches?.totalMatchRooms || 0,
      meta: `${stats?.matches?.totalMatchResults || 0} results submitted`,
      icon: "🎮",
    },
    {
      label: "Prize Distributed",
      value: formatCurrency(stats?.prizes?.totalPrizeDistributed || 0),
      meta: "Total prize payout",
      icon: "💰",
    },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Admin Control Center</p>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>
            Track platform activity, tournament status, teams, users, matches,
            and prize distribution from one place.
          </p>
        </div>
      </section>

      <section className={styles.grid}>
        {dashboardCards.map((card) => (
          <Card className={styles.statCard} key={card.label}>
            <div className={styles.cardTop}>
              <div className={styles.iconBox}>{card.icon}</div>
              <span className={styles.cardLabel}>{card.label}</span>
            </div>

            <strong className={styles.cardValue}>{card.value}</strong>
            <p className={styles.cardMeta}>{card.meta}</p>
          </Card>
        ))}
      </section>

      <section className={styles.summaryGrid}>
        <Card className={styles.panel}>
          <h2>Tournament Status</h2>

          <div className={styles.statusList}>
            <div>
              <span>Upcoming</span>
              <strong>{stats?.tournaments?.upcomingTournaments || 0}</strong>
            </div>

            <div>
              <span>Live</span>
              <strong>{stats?.tournaments?.liveTournaments || 0}</strong>
            </div>

            <div>
              <span>Completed</span>
              <strong>{stats?.tournaments?.completedTournaments || 0}</strong>
            </div>
          </div>
        </Card>

        <Card className={styles.panel}>
          <h2>Platform Health</h2>

          <div className={styles.healthBox}>
            <span className={styles.pulse}></span>
            <div>
              <strong>System Active</strong>
              <p>Backend APIs and dashboard data are responding normally.</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default AdminDashboard;
