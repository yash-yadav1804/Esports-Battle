import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import styles from "./CreateTournament.module.css";

const CreateTournament = () => {
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await API.post("/tournaments/createTournament", {
        title: formData.title,
        game: formData.game,
        mode: formData.mode,
        entryFee: Number(formData.entryFee),
        prizePool: Number(formData.prizePool),
        maxTeams: Number(formData.maxTeams),
        startDate: formData.startDate,
      });

      alert("Tournament created successfully");

      navigate("/tournaments");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create tournament");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Tournament</h1>
        <p className={styles.subtitle}>
          Admin can create a new esports tournament
        </p>

        <form onSubmit={handleCreateTournament}>
          <label className={styles.label}>Tournament Title</label>
          <input
            className={styles.input}
            type="text"
            name="title"
            placeholder="Enter tournament title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label className={styles.label}>Game</label>
          <select
            className={styles.input}
            name="game"
            value={formData.game}
            onChange={handleChange}
          >
            <option value="BGMI">BGMI</option>
            <option value="PUBG">PUBG</option>
            <option value="FREE FIRE">FREE FIRE</option>
          </select>

          <label className={styles.label}>Mode</label>
          <select
            className={styles.input}
            name="mode"
            value={formData.mode}
            onChange={handleChange}
          >
            <option value="Solo">Solo</option>
            <option value="Duo">Duo</option>
            <option value="Squad">Squad</option>
          </select>

          <label className={styles.label}>Entry Fee</label>
          <input
            className={styles.input}
            type="number"
            name="entryFee"
            placeholder="Enter entry fee"
            value={formData.entryFee}
            onChange={handleChange}
            required
          />

          <label className={styles.label}>Prize Pool</label>
          <input
            className={styles.input}
            type="number"
            name="prizePool"
            placeholder="Enter prize pool"
            value={formData.prizePool}
            onChange={handleChange}
            required
          />

          <label className={styles.label}>Max Teams</label>
          <input
            className={styles.input}
            type="number"
            name="maxTeams"
            placeholder="Enter max teams"
            value={formData.maxTeams}
            onChange={handleChange}
            required
          />

          <label className={styles.label}>Start Date</label>
          <input
            className={styles.input}
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Tournament"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTournament;
