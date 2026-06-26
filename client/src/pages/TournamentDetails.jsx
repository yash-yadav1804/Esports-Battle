import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import styles from "./TournamentDetails.module.css";

const TournamentDetails = () => {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  const registerTeam = async () => {
    try {
      setRegisterLoading(true);

      const res = await API.post(`/tournaments/register/${tournamentId}`);

      alert(res.data.message || "Team registered successfully");

      fetchTournament();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register team");
    } finally {
      setRegisterLoading(false);
    }
  };

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
          Registered Teams: {tournament.registeredTeams?.length || 0}/
          {tournament.maxTeams}
        </p>

        <p className={styles.info}>
          Start Date: {new Date(tournament.startDate).toLocaleDateString()}
        </p>

        {tournament.status === "upcoming" && (
          <button
            className={styles.registerBtn}
            onClick={registerTeam}
            disabled={registerLoading}
          >
            {registerLoading ? "Registering..." : "Register My Team"}
          </button>
        )}

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
