import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import styles from "./TournamentDetails.module.css";

const TournamentDetails = () => {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(`/tournaments/${tournamentId}`);
        setTournament(res.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch tournament");
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <h1>Loading tournament details...</h1>
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
      <Link className={styles.backLink} to="/tournaments">
        ← Back to Tournaments
      </Link>

      <div className={styles.card}>
        <h1 className={styles.title}>{tournament.title}</h1>

        <p className={styles.info}>Game: {tournament.game}</p>
        <p className={styles.info}>Mode: {tournament.mode}</p>
        <p className={styles.info}>Entry Fee: ₹{tournament.entryFee}</p>
        <p className={styles.info}>Prize Pool: ₹{tournament.prizePool}</p>
        <p className={styles.info}>Max Teams: {tournament.maxTeams}</p>
        <p className={styles.info}>Status: {tournament.status}</p>
        <p className={styles.info}>
          Start Date: {new Date(tournament.startDate).toLocaleDateString()}
        </p>

        <h2 className={styles.sectionTitle}>Registered Teams</h2>

        {tournament.registeredTeams?.length === 0 ? (
          <p>No teams registered yet</p>
        ) : (
          <ul className={styles.teamList}>
            {tournament.registeredTeams.map((team) => (
              <li key={team._id}>{team.teamName}</li>
            ))}
          </ul>
        )}

        <Link
          className={styles.linkButton}
          to={`/leaderboard/${tournament._id}`}
        >
          View Leaderboard
        </Link>
      </div>
    </div>
  );
};

export default TournamentDetails;
