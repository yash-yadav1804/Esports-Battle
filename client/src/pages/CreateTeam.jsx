import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/useToast";
import styles from "./CreateTeam.module.css";

const CreateTeam = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await API.post("/teams/create", {
        teamName: teamName.trim(),
      });

      toast.success("Team created successfully");

      navigate("/profile");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create team";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Team Management</p>

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

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Team"}
          </Button>
        </form>
      </section>
    </main>
  );
};

export default CreateTeam;
