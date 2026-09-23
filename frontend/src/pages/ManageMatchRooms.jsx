import { useEffect, useState } from "react";
import API from "../api/axios";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./ManageMatchRooms.module.css";

const MAP_OPTIONS = [
  "Erangel",
  "Miramar",
  "Sanhok",
  "Vikendi",
  "Livik",
  "Karakin",
];

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

const formatDateTime = (dateValue) => {
  if (!dateValue) return "Not scheduled";

  return new Date(dateValue).toLocaleString();
};

const toDateTimeLocalValue = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
};

const ManageMatchRooms = () => {
  const toast = useToast();

  const [matchRooms, setMatchRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const [editModal, setEditModal] = useState({
    isOpen: false,
    matchRoomId: "",
    tournamentTitle: "",
    formData: {
      matchNumber: "",
      map: "Erangel",
      roomId: "",
      roomPassword: "",
      matchTime: "",
    },
  });

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    matchRoomId: "",
    tournamentTitle: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadMatchRooms = async () => {
      try {
        const response = await API.get("/matchrooms/my-created");

        if (!isMounted) return;

        const data = getMatchRoomsData(response);

        setMatchRooms(Array.isArray(data) ? data : []);
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

    loadMatchRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshMatchRooms = async () => {
    const response = await API.get("/matchrooms/my-created");
    const data = getMatchRoomsData(response);

    setMatchRooms(Array.isArray(data) ? data : []);
  };

  const openEditModal = (room) => {
    setEditModal({
      isOpen: true,
      matchRoomId: room._id,
      tournamentTitle: getTournamentTitle(room),
      formData: {
        matchNumber: room.matchNumber || "",
        map: room.map || "Erangel",
        roomId: room.roomId || "",
        roomPassword: room.roomPassword || "",
        matchTime: toDateTimeLocalValue(room.matchTime),
      },
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      matchRoomId: "",
      tournamentTitle: "",
      formData: {
        matchNumber: "",
        map: "Erangel",
        roomId: "",
        roomPassword: "",
        matchTime: "",
      },
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditModal((currentModal) => ({
      ...currentModal,
      formData: {
        ...currentModal.formData,
        [name]: value,
      },
    }));
  };

  const updateMatchRoom = async (e) => {
    e.preventDefault();

    const { matchNumber, map, roomId, roomPassword, matchTime } =
      editModal.formData;

    if (!matchNumber || !roomId || !roomPassword || !matchTime) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setActionLoading(editModal.matchRoomId);

      const response = await API.patch(
        `/matchrooms/manage/${editModal.matchRoomId}`,
        {
          matchNumber: Number(matchNumber),
          map,
          roomId: Number(roomId),
          roomPassword: roomPassword.trim(),
          matchTime,
        },
      );

      toast.success(response.data.message || "Match room updated successfully");

      closeEditModal();
      await refreshMatchRooms();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update match room",
      );
    } finally {
      setActionLoading("");
    }
  };

  const openDeleteDialog = (room) => {
    setDeleteDialog({
      isOpen: true,
      matchRoomId: room._id,
      tournamentTitle: getTournamentTitle(room),
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      matchRoomId: "",
      tournamentTitle: "",
    });
  };

  const deleteMatchRoom = async () => {
    try {
      setActionLoading(deleteDialog.matchRoomId);

      const response = await API.delete(
        `/matchrooms/manage/${deleteDialog.matchRoomId}`,
      );

      toast.success(response.data.message || "Match room deleted successfully");

      closeDeleteDialog();
      await refreshMatchRooms();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete match room",
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading managed rooms"
          message="Fetching match rooms you are allowed to manage."
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
        <p className={styles.eyebrow}>Match Room Management</p>
        <h1 className={styles.title}>Manage Match Rooms</h1>
        <p className={styles.subtitle}>
          Update room IDs, passwords, maps, and match timing. Organizers can
          manage only rooms created for their own tournaments.
        </p>
      </section>

      {matchRooms.length === 0 ? (
        <EmptyState
          title="No match rooms to manage"
          message="Create a match room from your tournament management flow."
          actionLabel="Create Match Room"
          actionTo="/match-rooms/create"
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
                  <p className={styles.metaText}>
                    Created by {room.createdBy?.name || "Platform"}
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
                  <strong>{formatDateTime(room.matchTime)}</strong>
                </div>

                <div className={styles.infoBox}>
                  <span>Tournament Status</span>
                  <strong>{room.tournament?.status || "Scheduled"}</strong>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  type="button"
                  onClick={() => openEditModal(room)}
                  disabled={actionLoading === room._id}
                >
                  Edit Room
                </button>

                <button
                  className={styles.deleteBtn}
                  type="button"
                  onClick={() => openDeleteDialog(room)}
                  disabled={actionLoading === room._id}
                >
                  Delete Room
                </button>
              </div>
            </Card>
          ))}
        </section>
      )}

      {editModal.isOpen && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalCard} onSubmit={updateMatchRoom}>
            <p className={styles.modalEyebrow}>Edit Match Room</p>
            <h2>{editModal.tournamentTitle}</h2>

            <div className={styles.formGrid}>
              <label className={styles.formGroup}>
                Match Number
                <input
                  type="number"
                  name="matchNumber"
                  value={editModal.formData.matchNumber}
                  onChange={handleEditChange}
                  min="1"
                />
              </label>

              <label className={styles.formGroup}>
                Map
                <select
                  name="map"
                  value={editModal.formData.map}
                  onChange={handleEditChange}
                >
                  {MAP_OPTIONS.map((mapName) => (
                    <option key={mapName} value={mapName}>
                      {mapName}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.formGroup}>
                Room ID
                <input
                  type="number"
                  name="roomId"
                  value={editModal.formData.roomId}
                  onChange={handleEditChange}
                  min="1"
                />
              </label>

              <label className={styles.formGroup}>
                Room Password
                <input
                  type="text"
                  name="roomPassword"
                  value={editModal.formData.roomPassword}
                  onChange={handleEditChange}
                />
              </label>

              <label className={`${styles.formGroup} ${styles.fullWidth}`}>
                Match Time
                <input
                  type="datetime-local"
                  name="matchTime"
                  value={editModal.formData.matchTime}
                  onChange={handleEditChange}
                />
              </label>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                type="button"
                onClick={closeEditModal}
                disabled={actionLoading === editModal.matchRoomId}
              >
                Cancel
              </button>

              <button
                className={styles.saveBtn}
                type="submit"
                disabled={actionLoading === editModal.matchRoomId}
              >
                {actionLoading === editModal.matchRoomId
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteDialog.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteCard}>
            <div className={styles.deleteIcon}>!</div>
            <h2>Delete Match Room?</h2>
            <p>
              This will permanently delete the room for{" "}
              <strong>{deleteDialog.tournamentTitle}</strong>.
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                type="button"
                onClick={closeDeleteDialog}
                disabled={actionLoading === deleteDialog.matchRoomId}
              >
                Cancel
              </button>

              <button
                className={styles.deleteBtn}
                type="button"
                onClick={deleteMatchRoom}
                disabled={actionLoading === deleteDialog.matchRoomId}
              >
                {actionLoading === deleteDialog.matchRoomId
                  ? "Deleting..."
                  : "Delete Room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageMatchRooms;
