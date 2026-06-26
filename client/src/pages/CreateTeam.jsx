import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import styles from "./CreateTeam.module.css";

const CreateTeam = () => {
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await API.post("/teams/create", {
        teamName,
      });

      alert("Team created successfully");

      navigate("/profile");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Team</h1>
        <p className={styles.subtitle}>
          Create your esports team and become the IGL.
        </p>

        <form onSubmit={handleCreateTeam}>
          <label className={styles.label}>Team Name</label>

          <input
            className={styles.input}
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Team"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
