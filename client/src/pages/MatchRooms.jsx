import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

import styles from "./MatchRooms.module.css";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const getMatchRoomsData = (response) => {
  return (
    response.data?.matchRooms ||
    response.data?.rooms ||
    response.data?.data?.matchRooms ||
    response.data?.data?.rooms ||
    response.data?.data ||
    response.data ||
    []
  );
};

const getTournamentTitle = (room) => {
  return (
    room?.tournament?.title ||
    room?.tournamentId?.title ||
    room?.tournamentName ||
    "Tournament Room"
  );
};

const getRoomCreator = (room) => {
  return room?.createdBy?.name || room?.createdBy?.email || "Platform";
};

const formatMatchTime = (matchTime) => {
  if (!matchTime) return "Not scheduled";

  return new Date(matchTime).toLocaleString();
};

const MatchRooms = () => {
  const user = getStoredUser();

  const [matchRooms, setMatchRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canCreateMatchRoom =
    user?.role === "organizer" ||
    user?.role === "admin" ||
    user?.role === "superAdmin";

  useEffect(() => {
    let isMounted = true;

    const fetchMatchRooms = async () => {
      try {
        const response = await API.get("/matchrooms");

        if (!isMounted) return;

        const roomsData = getMatchRoomsData(response);

        setMatchRooms(Array.isArray(roomsData) ? roomsData : []);
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
        <div>
          <p className={styles.eyebrow}>Match Control</p>
          <h1 className={styles.title}>Match Rooms</h1>
          <p className={styles.subtitle}>
            View room ID, password, map, and match timing for created tournament
            rooms.
          </p>
        </div>

        {canCreateMatchRoom && (
          <Link className={styles.createButton} to="/match-rooms/create">
            Create Match Room
          </Link>
        )}
      </section>

      {matchRooms.length === 0 ? (
        <EmptyState
          title="No match rooms found"
          message="Match rooms created by organizers or admins will appear here."
          actionLabel={canCreateMatchRoom ? "Create Match Room" : undefined}
          actionTo={canCreateMatchRoom ? "/match-rooms/create" : undefined}
        />
      ) : (
        <section className={styles.grid}>
          {matchRooms.map((room) => (
            <Card className={styles.roomCard} key={room._id}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.roomLabel}>
                    Match #{room.matchNumber || "N/A"}
                  </p>
                  <h2>{getTournamentTitle(room)}</h2>

                  <p className={styles.creatorText}>
                    Created by {getRoomCreator(room)}
                  </p>
                </div>

                <span className={styles.mapBadge}>{room.map || "Erangel"}</span>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoBox}>
                  <span>Room ID</span>
                  <strong>{room.roomId || "Not added"}</strong>
                </div>

                <div className={styles.infoBox}>
                  <span>Password</span>
                  <strong>{room.roomPassword || "Not added"}</strong>
                </div>

                <div className={styles.infoBox}>
                  <span>Match Time</span>
                  <strong>{formatMatchTime(room.matchTime)}</strong>
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
