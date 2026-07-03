import { useMemo, useState } from "react";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useToast } from "../components/ui/useToast";

import styles from "./CreateTournament.module.css";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const CreateTournament = () => {
  const toast = useToast();
  const user = getStoredUser();

  const [formData, setFormData] = useState({
    title: "",
    game: "BGMI",
    mode: "Squad",
    entryFee: "",
    prizePool: "",
    maxTeams: "",
    startDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const estimatedSlots = useMemo(() => {
    if (!formData.maxTeams) return "Not set";
    return `${formData.maxTeams} teams`;
  }, [formData.maxTeams]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Tournament title is required");
      toast.error("Please enter tournament title");
      return false;
    }

    if (!formData.game.trim()) {
      setError("Game is required");
      toast.error("Please select game");
      return false;
    }

    if (!formData.mode.trim()) {
      setError("Mode is required");
      toast.error("Please select mode");
      return false;
    }

    if (formData.entryFee === "" || Number(formData.entryFee) < 0) {
      setError("Entry fee must be valid");
      toast.error("Please enter a valid entry fee");
      return false;
    }

    if (formData.prizePool === "" || Number(formData.prizePool) <= 0) {
      setError("Prize pool must be greater than 0");
      toast.error("Please enter a valid prize pool");
      return false;
    }

    if (!formData.maxTeams || Number(formData.maxTeams) <= 0) {
      setError("Max teams must be greater than 0");
      toast.error("Please enter valid max teams");
      return false;
    }

    if (!formData.startDate) {
      setError("Start date is required");
      toast.error("Please select tournament start date");
      return false;
    }

    setError("");
    return true;
  };

  const createTournament = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        game: formData.game,
        mode: formData.mode,
        entryFee: Number(formData.entryFee),
        prizePool: Number(formData.prizePool),
        maxTeams: Number(formData.maxTeams),
        startDate: formData.startDate,
      };

      const response = await API.post("/tournaments/createTournament", payload);

      toast.success(response.data.message || "Tournament created successfully");

      setFormData({
        title: "",
        game: "BGMI",
        mode: "Squad",
        entryFee: "",
        prizePool: "",
        maxTeams: "",
        startDate: "",
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create tournament";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Tournament Management</p>
        <h1 className={styles.title}>Create Tournament</h1>
        <p className={styles.subtitle}>
          Create a tournament with team slots, entry fee, prize pool, and start
          date. Organizers can create and manage their own tournaments, while
          admins can manage all platform tournaments.
        </p>
      </section>

      <section className={styles.contentGrid}>
        <Card className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>Tournament Setup</p>
              <h2>Basic Details</h2>
            </div>

            <span className={styles.badge}>{user?.role || "user"}</span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <form className={styles.form} onSubmit={createTournament}>
            <div className={styles.fullField}>
              <label className={styles.label} htmlFor="title">
                Tournament Title
              </label>

              <input
                id="title"
                className={styles.input}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: BGMI Summer Championship"
              />
            </div>

            <div className={styles.twoColumn}>
              <div>
                <label className={styles.label} htmlFor="game">
                  Game
                </label>

                <select
                  id="game"
                  className={styles.input}
                  name="game"
                  value={formData.game}
                  onChange={handleChange}
                >
                  <option value="BGMI">BGMI</option>
                  <option value="PUBG">PUBG</option>
                  <option value="FREE FIRE">FREE FIRE</option>
                </select>
              </div>

              <div>
                <label className={styles.label} htmlFor="mode">
                  Mode
                </label>

                <select
                  id="mode"
                  className={styles.input}
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                >
                  <option value="Solo">Solo</option>
                  <option value="Duo">Duo</option>
                  <option value="Squad">Squad</option>
                </select>
              </div>
            </div>

            <div className={styles.twoColumn}>
              <div>
                <label className={styles.label} htmlFor="entryFee">
                  Entry Fee
                </label>

                <input
                  id="entryFee"
                  className={styles.input}
                  type="number"
                  min="0"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  placeholder="Example: 100"
                />
              </div>

              <div>
                <label className={styles.label} htmlFor="prizePool">
                  Prize Pool
                </label>

                <input
                  id="prizePool"
                  className={styles.input}
                  type="number"
                  min="1"
                  name="prizePool"
                  value={formData.prizePool}
                  onChange={handleChange}
                  placeholder="Example: 5000"
                />
              </div>
            </div>

            <div className={styles.twoColumn}>
              <div>
                <label className={styles.label} htmlFor="maxTeams">
                  Max Teams
                </label>

                <input
                  id="maxTeams"
                  className={styles.input}
                  type="number"
                  min="1"
                  name="maxTeams"
                  value={formData.maxTeams}
                  onChange={handleChange}
                  placeholder="Example: 16"
                />
              </div>

              <div>
                <label className={styles.label} htmlFor="startDate">
                  Start Date
                </label>

                <input
                  id="startDate"
                  className={styles.input}
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating Tournament..." : "Create Tournament"}
            </Button>
          </form>
        </Card>

        <Card className={styles.previewCard}>
          <p className={styles.cardEyebrow}>Live Preview</p>

          <div className={styles.previewHeader}>
            <h2>{formData.title || "Tournament Title"}</h2>
            <span>Upcoming</span>
          </div>

          <p className={styles.sideMeta}>
            {formData.game} • {formData.mode}
          </p>

          <div className={styles.miniGrid}>
            <div>
              <span>Entry Fee</span>
              <strong>₹{formData.entryFee || 0}</strong>
            </div>

            <div>
              <span>Prize Pool</span>
              <strong>₹{formData.prizePool || 0}</strong>
            </div>

            <div>
              <span>Slots</span>
              <strong>{estimatedSlots}</strong>
            </div>

            <div>
              <span>Start Date</span>
              <strong>{formData.startDate || "Not set"}</strong>
            </div>
          </div>

          <div className={styles.previewNote}>
            This preview helps confirm what players will see before the
            tournament is published.
          </div>
        </Card>
      </section>

      <section className={styles.supportGrid}>
        <Card className={styles.infoCard}>
          <p className={styles.cardEyebrow}>Ownership Rule</p>
          <h2>Organizer Permissions</h2>

          <div className={styles.checkList}>
            <div>
              <span>01</span>
              <p>Organizer can create tournaments after approval.</p>
            </div>

            <div>
              <span>02</span>
              <p>Organizer can manage only tournaments created by them.</p>
            </div>

            <div>
              <span>03</span>
              <p>Admin and SuperAdmin can manage all tournaments.</p>
            </div>

            <div>
              <span>04</span>
              <p>Player cannot access tournament creation.</p>
            </div>
          </div>
        </Card>

        <Card className={styles.infoCard}>
          <p className={styles.cardEyebrow}>Tournament Flow</p>
          <h2>How it works</h2>

          <div className={styles.flowSteps}>
            <div>
              <strong>Create</strong>
              <p>Organizer creates tournament with basic details.</p>
            </div>

            <div>
              <strong>Register</strong>
              <p>Players register their teams in the tournament.</p>
            </div>

            <div>
              <strong>Play</strong>
              <p>Organizer creates match room and teams play.</p>
            </div>

            <div>
              <strong>Results</strong>
              <p>Results are approved and leaderboard gets updated.</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default CreateTournament;
