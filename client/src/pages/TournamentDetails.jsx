import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import styles from "./TournamentDetails.module.css";

const getTournamentDetails = async (tournamentId) => {
  const tournamentRes = await API.get(`/tournaments/${tournamentId}`);

  let myTeam = null;

  try {
    const teamRes = await API.get("/profile/my-team");
    myTeam = teamRes.data.team;
  } catch {
    myTeam = null;
  }

  return {
    tournament: tournamentRes.data,
    myTeam,
  };
};

const TournamentDetails = () => {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [myTeam, setMyTeam] = useState(null);

  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTournament = async () => {
      try {
        const data = await getTournamentDetails(tournamentId);

        if (!isMounted) return;

        setTournament(data.tournament);
        setMyTeam(data.myTeam);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(error.response?.data?.message || "Failed to fetch tournament");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTournament();

    return () => {
      isMounted = false;
    };
  }, [tournamentId]);

  const refreshTournament = async () => {
    try {
      const data = await getTournamentDetails(tournamentId);

      setTournament(data.tournament);
      setMyTeam(data.myTeam);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to refresh tournament");
    }
  };

  const registerTeam = async () => {
    try {
      setRegisterLoading(true);

      const res = await API.post(`/tournaments/register/${tournamentId}`);

      alert(res.data.message || "Team registered successfully");

      await refreshTournament();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register team");
    } finally {
      setRegisterLoading(false);
    }
  };

  const leaveTournament = async () => {
    const confirmLeave = window.confirm(
      "Are you sure you want to leave this tournament?",
    );

    if (!confirmLeave) return;

    try {
      setLeaveLoading(true);

      const res = await API.delete(`/tournaments/leave/${tournamentId}`);

      alert(res.data.message || "Team removed from tournament successfully");

      await refreshTournament();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to leave tournament");
    } finally {
      setLeaveLoading(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <h1>Loading tournament details...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <h1>Error</h1>
        <p className={styles.error}>{error}</p>
      </main>
    );
  }

  if (!tournament) {
    return (
      <main className={styles.page}>
        <h1>Tournament not found</h1>
      </main>
    );
  }

  const registeredTeams = tournament.registeredTeams || [];

  const isMyTeamRegistered = registeredTeams.some((team) => {
    const teamId = team?._id || team;
    return String(teamId) === String(myTeam?._id);
  });

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} to="/tournaments">
        ← Back to Tournaments
      </Link>

      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{tournament.title}</h1>
            <p className={styles.subtitle}>
              {tournament.game} • {tournament.mode}
            </p>
          </div>

          <span className={styles.status}>{tournament.status}</span>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoBox}>
            <span>Entry Fee</span>
            <strong>₹{tournament.entryFee}</strong>
          </div>

          <div className={styles.infoBox}>
            <span>Prize Pool</span>
            <strong>₹{tournament.prizePool}</strong>
          </div>

          <div className={styles.infoBox}>
            <span>Teams</span>
            <strong>
              {registeredTeams.length}/{tournament.maxTeams}
            </strong>
          </div>

          <div className={styles.infoBox}>
            <span>Start Date</span>
            <strong>
              {new Date(tournament.startDate).toLocaleDateString()}
            </strong>
          </div>
        </div>

        {tournament.status === "upcoming" && (
          <div className={styles.actions}>
            {!isMyTeamRegistered ? (
              <button
                className={styles.registerBtn}
                onClick={registerTeam}
                disabled={registerLoading}
              >
                {registerLoading ? "Registering..." : "Register My Team"}
              </button>
            ) : (
              <button
                className={styles.leaveBtn}
                onClick={leaveTournament}
                disabled={leaveLoading}
              >
                {leaveLoading ? "Leaving..." : "Leave Tournament"}
              </button>
            )}
          </div>
        )}

        {isMyTeamRegistered && (
          <p className={styles.successText}>
            Your team is registered in this tournament ✅
          </p>
        )}

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Registered Teams</h2>

          <Link
            className={styles.linkButton}
            to={`/leaderboard/${tournament._id}`}
          >
            View Leaderboard
          </Link>
        </div>

        {registeredTeams.length === 0 ? (
          <p className={styles.emptyText}>No teams registered yet.</p>
        ) : (
          <ul className={styles.teamList}>
            {registeredTeams.map((team) => (
              <li key={team?._id || team}>
                {team?.teamName || "Unknown Team"}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default TournamentDetails;
