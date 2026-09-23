import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import styles from "./Leaderboard.module.css";

const Leaderboard = () => {
  const { tournamentId } = useParams();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(`/leaderboard/${tournamentId}`);
        setLeaderboard(res.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch leaderboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <h1>Loading leaderboard...</h1>
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
      <Link className={styles.backLink} to={`/tournaments/${tournamentId}`}>
        ← Back to Tournament
      </Link>

      <h1 className={styles.title}>Leaderboard</h1>

      {leaderboard.length === 0 ? (
        <p>No leaderboard data available yet</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>

            <tbody>
              {leaderboard.map((item) => (
                <tr key={item.rank}>
                  <td>#{item.rank}</td>
                  <td>{item.team}</td>
                  <td>{item.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
