import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import styles from "./Tournaments.module.css";

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/tournaments");
        setTournaments(res.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch tournaments",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <h1>Loading tournaments...</h1>
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
      <h1 className={styles.title}>Tournaments</h1>

      {tournaments.length === 0 ? (
        <p>No tournaments found</p>
      ) : (
        <div className={styles.grid}>
          {tournaments.map((tournament) => (
            <div className={styles.card} key={tournament._id}>
              <h2 className={styles.cardTitle}>{tournament.title}</h2>

              <p className={styles.info}>Game: {tournament.game}</p>
              <p className={styles.info}>Mode: {tournament.mode}</p>
              <p className={styles.info}>Entry Fee: ₹{tournament.entryFee}</p>
              <p className={styles.info}>Prize Pool: ₹{tournament.prizePool}</p>
              <p className={styles.info}>
                Status:{" "}
                <span className={styles.status}>{tournament.status}</span>
              </p>

              <Link
                className={styles.linkButton}
                to={`/tournaments/${tournament._id}`}
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tournaments;
