import { useEffect, useState } from "react";
import API from "../api/axios";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

import styles from "./MatchRooms.module.css";

const MatchRooms = () => {
  const [matchRooms, setMatchRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMatchRooms = async () => {
      try {
        const res = await API.get("/matchrooms");

        if (!isMounted) return;

        setMatchRooms(res.data.matchRooms || res.data.rooms || res.data || []);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message || "Failed to fetch match rooms",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMatchRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading match rooms"
          message="Fetching room details for upcoming matches."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load match rooms" message={error} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Match Control</p>
        <h1 className={styles.title}>Match Rooms</h1>
        <p className={styles.subtitle}>
          View room ID, password, map, and match timing for created tournament
          rooms.
        </p>
      </section>

      {matchRooms.length === 0 ? (
        <EmptyState
          title="No match rooms found"
          message="Match rooms created by admin will appear here."
          actionLabel="Create Match Room"
          actionTo="/admin/create-match-room"
        />
      ) : (
        <section className={styles.grid}>
          {matchRooms.map((room) => (
            <Card className={styles.roomCard} key={room._id}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.roomLabel}>Match #{room.matchNumber}</p>
                  <h2>
                    {room.tournament?.title ||
                      room.tournamentId?.title ||
                      "Tournament Room"}
                  </h2>
                </div>

                <span className={styles.mapBadge}>{room.map}</span>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoBox}>
                  <span>Room ID</span>
                  <strong>{room.roomId}</strong>
                </div>

                <div className={styles.infoBox}>
                  <span>Password</span>
                  <strong>{room.roomPassword}</strong>
                </div>

                <div className={styles.infoBox}>
                  <span>Match Time</span>
                  <strong>
                    {room.matchTime
                      ? new Date(room.matchTime).toLocaleString()
                      : "Not scheduled"}
                  </strong>
                </div>

                <div className={styles.infoBox}>
                  <span>Status</span>
                  <strong>{room.status || "Scheduled"}</strong>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
};

export default MatchRooms;
