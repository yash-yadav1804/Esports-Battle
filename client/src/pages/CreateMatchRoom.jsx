import { useEffect, useState } from "react";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./CreateMatchRoom.module.css";

const CreateMatchRoom = () => {
  const toast = useToast();

  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    tournamentId: "",
    matchNumber: "",
    map: "Erangel",
    roomId: "",
    roomPassword: "",
    matchTime: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTournaments = async () => {
      try {
        const res = await API.get("/tournaments");

        if (!isMounted) return;

        setTournaments(res.data || []);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message || "Failed to fetch tournaments",
        );
      } finally {
        if (isMounted) {
          setLoadingTournaments(false);
        }
      }
    };

    fetchTournaments();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData((currentData) => ({
      ...currentData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateMatchRoom = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        matchNumber: Number(formData.matchNumber),
        map: formData.map,
        roomId: formData.roomId.trim(),
        roomPassword: formData.roomPassword.trim(),
        matchTime: formData.matchTime,
      };

      const res = await API.post(
        `/matchrooms/create/${formData.tournamentId}`,
        payload,
      );

      toast.success(res.data.message || "Match room created successfully");

      setFormData({
        tournamentId: "",
        matchNumber: "",
        map: "Erangel",
        roomId: "",
        roomPassword: "",
        matchTime: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create match room",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTournaments) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading tournaments"
          message="Fetching tournaments for match room creation."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load tournaments" message={error} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Admin Match Control</p>
        <h1 className={styles.title}>Create Match Room</h1>
        <p className={styles.subtitle}>
          Add private room details for a tournament so registered teams can join
          the match on time.
        </p>
      </section>

      <Card className={styles.formCard}>
        <form onSubmit={handleCreateMatchRoom}>
          <label className={styles.label}>Tournament</label>
          <select
            className={styles.input}
            name="tournamentId"
            value={formData.tournamentId}
            onChange={handleChange}
            required
          >
            <option value="">Select tournament</option>

            {tournaments.map((tournament) => (
              <option value={tournament._id} key={tournament._id}>
                {tournament.title} — {tournament.status}
              </option>
            ))}
          </select>

          <div className={styles.twoColumn}>
            <div>
              <label className={styles.label}>Match Number</label>
              <input
                className={styles.input}
                type="number"
                name="matchNumber"
                placeholder="Example: 1"
                value={formData.matchNumber}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div>
              <label className={styles.label}>Map</label>
              <select
                className={styles.input}
                name="map"
                value={formData.map}
                onChange={handleChange}
              >
                <option value="Erangel">Erangel</option>
                <option value="Miramar">Miramar</option>
                <option value="Sanhok">Sanhok</option>
                <option value="Vikendi">Vikendi</option>
                <option value="Livik">Livik</option>
              </select>
            </div>
          </div>

          <div className={styles.twoColumn}>
            <div>
              <label className={styles.label}>Room ID</label>
              <input
                className={styles.input}
                type="text"
                name="roomId"
                placeholder="Enter room ID"
                value={formData.roomId}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className={styles.label}>Room Password</label>
              <input
                className={styles.input}
                type="text"
                name="roomPassword"
                placeholder="Enter room password"
                value={formData.roomPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label className={styles.label}>Match Time</label>
          <input
            className={styles.input}
            type="datetime-local"
            name="matchTime"
            value={formData.matchTime}
            onChange={handleChange}
            required
          />

          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating Room..." : "Create Match Room"}
          </Button>
        </form>
      </Card>
    </main>
  );
};

export default CreateMatchRoom;
