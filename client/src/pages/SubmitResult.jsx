import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./SubmitResult.module.css";

const getRoomTournamentId = (room) => {
  return (
    room.tournament?._id ||
    room.tournament ||
    room.tournamentId?._id ||
    room.tournamentId
  );
};

const SubmitResult = () => {
  const toast = useToast();

  const [tournaments, setTournaments] = useState([]);
  const [matchRooms, setMatchRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    tournamentId: "",
    matchRoomId: "",
    kills: "",
    position: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [tournamentsRes, matchRoomsRes] = await Promise.all([
          API.get("/tournaments"),
          API.get("/matchrooms"),
        ]);

        if (!isMounted) return;

        setTournaments(tournamentsRes.data || []);
        setMatchRooms(
          matchRoomsRes.data.matchRooms ||
            matchRoomsRes.data.rooms ||
            matchRoomsRes.data ||
            [],
        );
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(error.response?.data?.message || "Failed to load result form");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMatchRooms = useMemo(() => {
    if (!formData.tournamentId) return [];

    return matchRooms.filter((room) => {
      const roomTournamentId = getRoomTournamentId(room);
      return String(roomTournamentId) === String(formData.tournamentId);
    });
  }, [formData.tournamentId, matchRooms]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
      ...(name === "tournamentId" ? { matchRoomId: "" } : {}),
    }));
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        tournamentId: formData.tournamentId,
        matchRoomId: formData.matchRoomId,
        kills: Number(formData.kills),
        position: Number(formData.position),
      };

      const res = await API.post("/result-submissions/submit", payload);

      toast.success(
        res.data.message || "Result submitted successfully for admin approval",
      );

      setFormData({
        tournamentId: "",
        matchRoomId: "",
        kills: "",
        position: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit result");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading result form"
          message="Fetching tournaments and match rooms."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load result form" message={error} />
      </main>
    );
  }

  if (tournaments.length === 0) {
    return (
      <main className={styles.page}>
        <EmptyState
          title="No tournaments found"
          message="You can submit results only after tournaments are created."
          actionLabel="View Tournaments"
          actionTo="/tournaments"
        />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Player Match Report</p>
        <h1 className={styles.title}>Submit Match Result</h1>
        <p className={styles.subtitle}>
          Submit your team's kills and placement for admin verification. Once
          approved, points will be added to the leaderboard.
        </p>
      </section>

      <Card className={styles.formCard}>
        <form onSubmit={handleSubmitResult}>
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

          <label className={styles.label}>Match Room</label>
          <select
            className={styles.input}
            name="matchRoomId"
            value={formData.matchRoomId}
            onChange={handleChange}
            disabled={!formData.tournamentId}
            required
          >
            <option value="">
              {formData.tournamentId
                ? "Select match room"
                : "Select tournament first"}
            </option>

            {filteredMatchRooms.map((room) => (
              <option value={room._id} key={room._id}>
                Match #{room.matchNumber} — {room.map} — Room {room.roomId}
              </option>
            ))}
          </select>

          {formData.tournamentId && filteredMatchRooms.length === 0 && (
            <p className={styles.helperText}>
              No match rooms found for this tournament yet.
            </p>
          )}

          <div className={styles.twoColumn}>
            <div>
              <label className={styles.label}>Kills</label>
              <input
                className={styles.input}
                type="number"
                name="kills"
                placeholder="Example: 8"
                value={formData.kills}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div>
              <label className={styles.label}>Position</label>
              <input
                className={styles.input}
                type="number"
                name="position"
                placeholder="Example: 2"
                value={formData.position}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Result"}
          </Button>
        </form>
      </Card>
    </main>
  );
};

export default SubmitResult;
