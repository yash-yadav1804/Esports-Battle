import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./Teams.module.css";

const Teams = () => {
  const toast = useToast();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestLoading, setRequestLoading] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTeams = async () => {
      try {
        const res = await API.get("/teams");

        if (!isMounted) return;

        setTeams(res.data);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(error.response?.data?.message || "Failed to fetch teams");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTeams();

    return () => {
      isMounted = false;
    };
  }, []);

  const sendJoinRequest = async (teamId) => {
    try {
      setRequestLoading(teamId);

      const res = await API.post(`/team-requests/send/${teamId}`);

      toast.success(res.data.message || "Join request sent successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send join request",
      );
    } finally {
      setRequestLoading("");
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading teams"
          message="Fetching available esports teams."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load teams" message={error} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Team Hub</p>
          <h1 className={styles.title}>Teams</h1>
          <p className={styles.subtitle}>
            Explore teams, send join requests, or create your own squad.
          </p>
        </div>

        <Link className={styles.createButton} to="/teams/create">
          Create Team
        </Link>
      </section>

      {teams.length === 0 ? (
        <EmptyState
          title="No teams available"
          message="Create your first team and start building your squad."
          actionLabel="Create Team"
          actionTo="/teams/create"
        />
      ) : (
        <section className={styles.grid}>
          {teams.map((team) => (
            <Card className={styles.teamCard} key={team._id}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.teamName}>{team.teamName}</h2>
                  <p className={styles.teamMeta}>Competitive Squad</p>
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.statBox}>
                  <span>Total Players</span>
                  <strong>{team.players?.length || 0}</strong>
                </div>

                <div className={styles.statBox}>
                  <span>Max Players</span>
                  <strong>{team.maxPlayers || 4}</strong>
                </div>
              </div>

              <Button
                onClick={() => sendJoinRequest(team._id)}
                disabled={requestLoading === team._id}
              >
                {requestLoading === team._id
                  ? "Sending..."
                  : "Send Join Request"}
              </Button>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
};

export default Teams;
