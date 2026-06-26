import { useEffect, useState } from "react";
import API from "../api/axios";
import styles from "./Teams.module.css";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestLoading, setRequestLoading] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/teams");
        setTeams(res.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const sendJoinRequest = async (teamId) => {
    try {
      setRequestLoading(teamId);

      const res = await API.post(`/team-requests/send/${teamId}`);

      alert(res.data.message || "Join request sent successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send join request");
    } finally {
      setRequestLoading("");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <h1>Loading teams...</h1>
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
      <h1 className={styles.title}>Teams</h1>

      {teams.length === 0 ? (
        <p>No teams found</p>
      ) : (
        <div className={styles.grid}>
          {teams.map((team) => (
            <div className={styles.card} key={team._id}>
              <h2 className={styles.teamName}>{team.teamName}</h2>

              <p>Total Players: {team.players?.length || 0}</p>
              <p>Max Players: {team.maxPlayers}</p>

              <button
                className={styles.button}
                onClick={() => sendJoinRequest(team._id)}
                disabled={requestLoading === team._id}
              >
                {requestLoading === team._id
                  ? "Sending..."
                  : "Send Join Request"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
