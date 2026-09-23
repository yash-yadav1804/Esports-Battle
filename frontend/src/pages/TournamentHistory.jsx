import { useEffect, useState } from "react";
import API from "../api/axios";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

import styles from "./TournamentHistory.module.css";

const formatCurrency = (amount = 0) => {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const TournamentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTournamentHistory = async () => {
      try {
        const res = await API.get("/tournaments/history/completed");

        if (!isMounted) return;

        setHistory(res.data.history || []);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message || "Failed to fetch tournament history",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTournamentHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading tournament history"
          message="Fetching completed tournaments, winners, and prize distribution."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load history" message={error} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Hall of Champions</p>
        <h1 className={styles.title}>Tournament History</h1>
        <p className={styles.subtitle}>
          View completed tournaments, winning teams, prize pool distribution,
          and final results.
        </p>
      </section>

      {history.length === 0 ? (
        <EmptyState
          title="No completed tournaments"
          message="Completed tournaments and winners will appear here after admin completes a tournament."
          actionLabel="View Tournaments"
          actionTo="/tournaments"
        />
      ) : (
        <section className={styles.grid}>
          {history.map((item) => (
            <Card className={styles.historyCard} key={item.tournamentId}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.completedLabel}>Completed Tournament</p>
                  <h2>{item.tournamentName}</h2>
                  <p className={styles.meta}>
                    {item.game} • {item.mode}
                  </p>
                </div>

                <div className={styles.winnerBadge}>
                  Winner: <strong>{item.winner}</strong>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span>Prize Pool</span>
                  <strong>{formatCurrency(item.prizePool)}</strong>
                </div>

                <div className={styles.statBox}>
                  <span>Entry Fee</span>
                  <strong>{formatCurrency(item.entryFee)}</strong>
                </div>

                <div className={styles.statBox}>
                  <span>Registered Teams</span>
                  <strong>{item.totalRegisteredTeams}</strong>
                </div>

                <div className={styles.statBox}>
                  <span>Completed At</span>
                  <strong>
                    {item.completedAt
                      ? new Date(item.completedAt).toLocaleDateString()
                      : "N/A"}
                  </strong>
                </div>
              </div>

              <div className={styles.prizeSection}>
                <h3>Prize Distribution</h3>

                <div className={styles.prizeGrid}>
                  <div className={styles.prizeBox}>
                    <span className={styles.rank}>1st</span>
                    <strong>{item.firstPlace?.team || "N/A"}</strong>
                    <p>{formatCurrency(item.firstPlace?.amount || 0)}</p>
                  </div>

                  <div className={styles.prizeBox}>
                    <span className={styles.rank}>2nd</span>
                    <strong>{item.secondPlace?.team || "N/A"}</strong>
                    <p>{formatCurrency(item.secondPlace?.amount || 0)}</p>
                  </div>

                  <div className={styles.prizeBox}>
                    <span className={styles.rank}>3rd</span>
                    <strong>{item.thirdPlace?.team || "N/A"}</strong>
                    <p>{formatCurrency(item.thirdPlace?.amount || 0)}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
};

export default TournamentHistory;
