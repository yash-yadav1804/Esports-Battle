import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./TournamentDetails.module.css";

const getStatusVariant = (status) => {
  if (status === "live") return "warning";
  if (status === "completed") return "danger";

  return "success";
};

const getTournamentDetails = async (tournamentId) => {
  const tournamentRes = await API.get(`/tournaments/${tournamentId}`);

  try {
    const teamRes = await API.get("/profile/my-team");

    return {
      tournament: tournamentRes.data,
      myTeam: teamRes.data.team,
    };
  } catch {
    return {
      tournament: tournamentRes.data,
      myTeam: null,
    };
  }
};

const TournamentDetails = () => {
  const { tournamentId } = useParams();
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const [startLoading, setStartLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);

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
      toast.error(
        error.response?.data?.message || "Failed to refresh tournament",
      );
    }
  };

  const registerTeam = async () => {
    try {
      setRegisterLoading(true);

      const res = await API.post(`/tournaments/register/${tournamentId}`);

      toast.success(res.data.message || "Team registered successfully");

      await refreshTournament();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register team");
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

      toast.success(
        res.data.message || "Team removed from tournament successfully",
      );

      await refreshTournament();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to leave tournament",
      );
    } finally {
      setLeaveLoading(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading tournament"
          message="Fetching tournament details, registered teams, and your team status."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load tournament" message={error} />
      </main>
    );
  }

  if (!tournament) {
    return (
      <main className={styles.page}>
        <ErrorState
          title="Tournament not found"
          message="This tournament may have been deleted or the link is invalid."
        />
      </main>
    );
  }
  const startTournament = async () => {
    const confirmStart = window.confirm(
      "Are you sure you want to start this tournament?",
    );

    if (!confirmStart) return;

    try {
      setStartLoading(true);

      const res = await API.post(`/tournaments/start/${tournamentId}`);

      toast.success(res.data.message || "Tournament started successfully");

      await refreshTournament();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to start tournament",
      );
    } finally {
      setStartLoading(false);
    }
  };

  const completeTournament = async () => {
    const confirmComplete = window.confirm(
      "Are you sure you want to complete this tournament?",
    );

    if (!confirmComplete) return;

    try {
      setCompleteLoading(true);

      const res = await API.post(`/tournaments/complete/${tournamentId}`);

      toast.success(res.data.message || "Tournament completed successfully");

      await refreshTournament();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to complete tournament",
      );
    } finally {
      setCompleteLoading(false);
    }
  };

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

      <Card className={styles.detailsCard}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Tournament Details</p>

            <div className={styles.titleRow}>
              <h1 className={styles.title}>{tournament.title}</h1>

              <Badge variant={getStatusVariant(tournament.status)}>
                {tournament.status}
              </Badge>
            </div>

            <p className={styles.subtitle}>
              {tournament.game} • {tournament.mode} • Competitive esports event
            </p>
          </div>
        </section>

        <section className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span>Entry Fee</span>
            <strong>₹{tournament.entryFee}</strong>
          </div>

          <div className={styles.statBox}>
            <span>Prize Pool</span>
            <strong>₹{tournament.prizePool}</strong>
          </div>

          <div className={styles.statBox}>
            <span>Teams</span>
            <strong>
              {registeredTeams.length}/{tournament.maxTeams}
            </strong>
          </div>

          <div className={styles.statBox}>
            <span>Start Date</span>
            <strong>
              {new Date(tournament.startDate).toLocaleDateString()}
            </strong>
          </div>
        </section>

        {tournament.status === "upcoming" && (
          <section className={styles.actions}>
            {!isMyTeamRegistered ? (
              <Button onClick={registerTeam} disabled={registerLoading}>
                {registerLoading ? "Registering..." : "Register My Team"}
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={leaveTournament}
                disabled={leaveLoading}
              >
                {leaveLoading ? "Leaving..." : "Leave Tournament"}
              </Button>
            )}
          </section>
        )}

        {isMyTeamRegistered && (
          <div className={styles.successBox}>
            Your team is registered in this tournament ✅
          </div>
        )}
        {isAdmin && (
          <section className={styles.adminPanel}>
            <div>
              <p className={styles.adminEyebrow}>Admin Controls</p>
              <h2 className={styles.adminTitle}>Tournament Actions</h2>
              <p className={styles.adminSubtitle}>
                Start or complete this tournament based on its current status.
              </p>
            </div>

            <div className={styles.adminActions}>
              {tournament.status === "upcoming" && (
                <Button onClick={startTournament} disabled={startLoading}>
                  {startLoading ? "Starting..." : "Start Tournament"}
                </Button>
              )}

              {tournament.status === "live" && (
                <Button
                  variant="danger"
                  onClick={completeTournament}
                  disabled={completeLoading}
                >
                  {completeLoading ? "Completing..." : "Complete Tournament"}
                </Button>
              )}

              {tournament.status === "completed" && (
                <span className={styles.completedText}>
                  Tournament already completed ✅
                </span>
              )}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Registered Teams</h2>
              <p className={styles.sectionSubtitle}>
                Teams currently participating in this tournament.
              </p>
            </div>

            <Link
              className={styles.leaderboardLink}
              to={`/leaderboard/${tournament._id}`}
            >
              View Leaderboard
            </Link>
          </div>

          {registeredTeams.length === 0 ? (
            <div className={styles.emptyBox}>
              No teams registered yet. Be the first team to join.
            </div>
          ) : (
            <div className={styles.teamGrid}>
              {registeredTeams.map((team, index) => (
                <div className={styles.teamCard} key={team?._id || team}>
                  <span className={styles.teamRank}>#{index + 1}</span>
                  <strong>{team?.teamName || "Unknown Team"}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </Card>
    </main>
  );
};

export default TournamentDetails;
