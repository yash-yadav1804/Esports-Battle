import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

import styles from "./AdminDashboard.module.css";

const formatCurrency = (amount = 0) => {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const formatNumber = (value = 0) => {
  return Number(value).toLocaleString("en-IN");
};

const getPercent = (value = 0, total = 0) => {
  if (!total) return 0;

  return Math.min(100, Math.round((Number(value) / Number(total)) * 100));
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

  const users = stats?.users || {};
  const teams = stats?.teams || {};
  const tournaments = stats?.tournaments || {};
  const matches = stats?.matches || {};
  const prizes = stats?.prizes || {};

  const dashboardCards = [
    {
      label: "Total Users",
      value: formatNumber(users.totalUsers || 0),
      meta: `${users.totalPlayers || 0} players • ${
        users.totalAdmins || 0
      } admins`,
      icon: "👥",
      route: "/admin/manage-users",
    },
    {
      label: "Total Teams",
      value: formatNumber(teams.totalTeams || 0),
      meta: "Registered esports teams",
      icon: "🛡️",
      route: "/admin/manage-teams",
    },
    {
      label: "Tournaments",
      value: formatNumber(tournaments.totalTournaments || 0),
      meta: `${tournaments.upcomingTournaments || 0} upcoming • ${
        tournaments.liveTournaments || 0
      } live`,
      icon: "🏆",
      route: "/admin/manage-tournaments",
    },
    {
      label: "Match Rooms",
      value: formatNumber(matches.totalMatchRooms || 0),
      meta: `${matches.totalMatchResults || 0} approved match results`,
      icon: "🎮",
      route: "/match-rooms",
    },
    {
      label: "Completed",
      value: formatNumber(tournaments.completedTournaments || 0),
      meta: "Finished tournaments",
      icon: "✅",
      route: "/history",
    },
    {
      label: "Prize Distributed",
      value: formatCurrency(prizes.totalPrizeDistributed || 0),
      meta: "Total platform payout",
      icon: "💰",
      route: "/history",
    },
  ];

  const tournamentStatus = [
    {
      label: "Upcoming",
      value: tournaments.upcomingTournaments || 0,
      percent: getPercent(
        tournaments.upcomingTournaments,
        tournaments.totalTournaments,
      ),
    },
    {
      label: "Live",
      value: tournaments.liveTournaments || 0,
      percent: getPercent(
        tournaments.liveTournaments,
        tournaments.totalTournaments,
      ),
    },
    {
      label: "Completed",
      value: tournaments.completedTournaments || 0,
      percent: getPercent(
        tournaments.completedTournaments,
        tournaments.totalTournaments,
      ),
    },
  ];

  const quickActions = [
    {
      title: "Create Tournament",
      description: "Add a new BGMI/PUBG tournament for players.",
      route: "/admin/create-tournament",
      icon: "➕",
    },
    {
      title: "Create Match Room",
      description: "Create room ID and password for tournament matches.",
      route: "/admin/create-match-room",
      icon: "🎯",
    },
    {
      title: "Review Results",
      description: "Approve or reject player result submissions.",
      route: "/admin/pending-results",
      icon: "🧾",
    },
    {
      title: "Manage Teams",
      description: "Update or remove invalid teams from platform.",
      route: "/admin/manage-teams",
      icon: "🛡️",
    },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Admin Control Center</p>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>
            Monitor users, teams, tournaments, match rooms, results, and prize
            distribution from one professional admin workspace.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link to="/admin/create-tournament" className={styles.primaryAction}>
            Create Tournament
          </Link>

          <Link to="/admin/pending-results" className={styles.secondaryAction}>
            Review Results
          </Link>
        </div>
      </section>

      <section className={styles.grid}>
        {dashboardCards.map((card) => (
          <Link to={card.route} className={styles.cardLink} key={card.label}>
            <Card className={styles.statCard}>
              <div className={styles.cardTop}>
                <div className={styles.iconBox}>{card.icon}</div>
                <span className={styles.cardLabel}>{card.label}</span>
              </div>

              <strong className={styles.cardValue}>{card.value}</strong>
              <p className={styles.cardMeta}>{card.meta}</p>
            </Card>
          </Link>
        ))}
      </section>

      <section className={styles.summaryGrid}>
        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Tournament Status</h2>
              <p>Current distribution of all tournaments.</p>
            </div>

            <Link to="/admin/manage-tournaments" className={styles.panelLink}>
              Manage
            </Link>
          </div>

          <div className={styles.statusList}>
            {tournamentStatus.map((item) => (
              <div className={styles.statusItem} key={item.label}>
                <div className={styles.statusTop}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Platform Health</h2>
              <p>Backend and dashboard data are responding properly.</p>
            </div>
          </div>

          <div className={styles.healthBox}>
            <span className={styles.pulse}></span>
            <div>
              <strong>System Active</strong>
              <p>
                Admin APIs, tournament data, users, teams, and match statistics
                are available.
              </p>
            </div>
          </div>

          <div className={styles.healthStats}>
            <div>
              <span>Total Records</span>
              <strong>
                {formatNumber(
                  (users.totalUsers || 0) +
                    (teams.totalTeams || 0) +
                    (tournaments.totalTournaments || 0) +
                    (matches.totalMatchRooms || 0) +
                    (matches.totalMatchResults || 0),
                )}
              </strong>
            </div>

            <div>
              <span>Approved Results</span>
              <strong>{formatNumber(matches.totalMatchResults || 0)}</strong>
            </div>
          </div>
        </Card>
      </section>

      <section className={styles.actionsGrid}>
        {quickActions.map((action) => (
          <Link
            to={action.route}
            className={styles.actionCard}
            key={action.title}
          >
            <span>{action.icon}</span>
            <div>
              <strong>{action.title}</strong>
              <p>{action.description}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
};

export default AdminDashboard;
