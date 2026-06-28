import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useToast } from "../components/ui/useToast";

import styles from "./CreateTeam.module.css";

const CreateTeam = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createTeam = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setError("Team name is required");
      toast.error("Please enter a team name");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/teams/create", {
        teamName: teamName.trim(),
      });

      toast.success(res.data.message || "Team created successfully");

      setTeamName("");
      navigate("/teams");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create team";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Team Management</p>
        <h1 className={styles.title}>Create Team</h1>
        <p className={styles.subtitle}>
          Create your esports team, become the IGL, invite players, and register
          your squad for upcoming tournaments.
        </p>
      </section>

      <section className={styles.contentGrid}>
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>New Squad</p>
              <h2>Create your team</h2>
            </div>

            <span className={styles.badge}>IGL Role</span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <form className={styles.form} onSubmit={createTeam}>
            <div>
              <label className={styles.label} htmlFor="teamName">
                Team Name
              </label>

              <input
                id="teamName"
                className={styles.input}
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Example: Team Alpha"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating Team..." : "Create Team"}
            </Button>
          </form>

          <p className={styles.footerText}>
            Already have a team? <Link to="/teams">View all teams</Link>
          </p>
        </Card>

        <aside className={styles.sidePanel}>
          <Card className={styles.infoCard}>
            <p className={styles.cardEyebrow}>Team Rules</p>
            <h2>Before creating a team</h2>

            <div className={styles.ruleList}>
              <div>
                <span>01</span>
                <p>Team name should be unique and easy to identify.</p>
              </div>

              <div>
                <span>02</span>
                <p>You will become the IGL after creating the team.</p>
              </div>

              <div>
                <span>03</span>
                <p>Players can send join requests to your team.</p>
              </div>

              <div>
                <span>04</span>
                <p>Your team can register in upcoming tournaments.</p>
              </div>
            </div>
          </Card>

          <Card className={styles.infoCard}>
            <p className={styles.cardEyebrow}>Next Steps</p>
            <h2>After team creation</h2>

            <div className={styles.nextSteps}>
              <Link to="/team-requests">Manage Team Requests</Link>
              <Link to="/tournaments">Register in Tournament</Link>
              <Link to="/match-rooms">View Match Rooms</Link>
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
};

export default CreateTeam;
