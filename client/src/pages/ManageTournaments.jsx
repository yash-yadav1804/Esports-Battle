import { useEffect, useState } from "react";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";
import ConfirmDialog from "../components/ui/ConfirmDialog";

import styles from "./ManageTournaments.module.css";

const ManageTournaments = () => {
  const toast = useToast();

  const [tournaments, setTournaments] = useState([]);
  const [editingTournamentId, setEditingTournamentId] = useState("");
  const [editData, setEditData] = useState({
    title: "",
    game: "",
    mode: "",
    entryFee: "",
    prizePool: "",
    maxTeams: "",
    startDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    tournamentId: "",
    tournamentName: "",
  });

  const fetchTournaments = async () => {
    try {
      const res = await API.get("/tournaments");

      setTournaments(res.data || []);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch tournaments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTournaments = async () => {
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
          setLoading(false);
        }
      }
    };

    loadTournaments();

    return () => {
      isMounted = false;
    };
  }, []);

  const startEditing = (tournament) => {
    setEditingTournamentId(tournament._id);

    setEditData({
      title: tournament.title || "",
      game: tournament.game || "BGMI",
      mode: tournament.mode || "Squad",
      entryFee: tournament.entryFee || "",
      prizePool: tournament.prizePool || "",
      maxTeams: tournament.maxTeams || "",
      startDate: tournament.startDate
        ? new Date(tournament.startDate).toISOString().split("T")[0]
        : "",
    });
  };

  const cancelEditing = () => {
    setEditingTournamentId("");
    setEditData({
      title: "",
      game: "",
      mode: "",
      entryFee: "",
      prizePool: "",
      maxTeams: "",
      startDate: "",
    });
  };

  const handleEditChange = (e) => {
    setEditData((currentData) => ({
      ...currentData,
      [e.target.name]: e.target.value,
    }));
  };

  const updateTournament = async (tournamentId) => {
    try {
      setActionLoading(tournamentId);

      const payload = {
        title: editData.title.trim(),
        game: editData.game,
        mode: editData.mode,
        entryFee: Number(editData.entryFee),
        prizePool: Number(editData.prizePool),
        maxTeams: Number(editData.maxTeams),
        startDate: editData.startDate,
      };

      const res = await API.patch(
        `/admin/tournaments/${tournamentId}`,
        payload,
      );

      toast.success(res.data.message || "Tournament updated successfully");

      cancelEditing();
      await fetchTournaments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update tournament",
      );
    } finally {
      setActionLoading("");
    }
  };

  const openDeleteDialog = (tournament) => {
    setDeleteDialog({
      isOpen: true,
      tournamentId: tournament._id,
      tournamentName: tournament.title,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      tournamentId: "",
      tournamentName: "",
    });
  };

  const confirmDeleteTournament = async () => {
    try {
      setActionLoading(deleteDialog.tournamentId);

      const res = await API.delete(
        `/admin/tournaments/${deleteDialog.tournamentId}`,
      );

      toast.success(res.data.message || "Tournament deleted successfully");

      closeDeleteDialog();
      await fetchTournaments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete tournament",
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading tournaments"
          message="Fetching tournaments for admin management."
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
        <p className={styles.eyebrow}>Admin Tournament Control</p>
        <h1 className={styles.title}>Manage Tournaments</h1>
        <p className={styles.subtitle}>
          Update tournament details or delete tournaments along with their
          related match rooms, match results, and prize data.
        </p>
      </section>

      {tournaments.length === 0 ? (
        <EmptyState
          title="No tournaments found"
          message="Create a tournament first to manage it here."
          actionLabel="Create Tournament"
          actionTo="/admin/create-tournament"
        />
      ) : (
        <section className={styles.grid}>
          {tournaments.map((tournament) => {
            const isEditing = editingTournamentId === tournament._id;

            return (
              <Card className={styles.tournamentCard} key={tournament._id}>
                {!isEditing ? (
                  <>
                    <div className={styles.cardHeader}>
                      <div>
                        <p className={styles.status}>{tournament.status}</p>
                        <h2>{tournament.title}</h2>
                        <p className={styles.meta}>
                          {tournament.game} • {tournament.mode}
                        </p>
                      </div>
                    </div>

                    <div className={styles.infoGrid}>
                      <div className={styles.infoBox}>
                        <span>Entry Fee</span>
                        <strong>₹{tournament.entryFee}</strong>
                      </div>

                      <div className={styles.infoBox}>
                        <span>Prize Pool</span>
                        <strong>₹{tournament.prizePool}</strong>
                      </div>

                      <div className={styles.infoBox}>
                        <span>Teams</span>
                        <strong>
                          {tournament.registeredTeams?.length || 0}/
                          {tournament.maxTeams}
                        </strong>
                      </div>

                      <div className={styles.infoBox}>
                        <span>Start Date</span>
                        <strong>
                          {tournament.startDate
                            ? new Date(
                                tournament.startDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <Button
                        variant="secondary"
                        onClick={() => startEditing(tournament)}
                        disabled={tournament.status === "completed"}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => openDeleteDialog(tournament)}
                        disabled={actionLoading === tournament._id}
                      >
                        {actionLoading === tournament._id
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className={styles.editTitle}>Edit Tournament</h2>

                    <label className={styles.label}>Title</label>
                    <input
                      className={styles.input}
                      type="text"
                      name="title"
                      value={editData.title}
                      onChange={handleEditChange}
                    />

                    <div className={styles.twoColumn}>
                      <div>
                        <label className={styles.label}>Game</label>
                        <select
                          className={styles.input}
                          name="game"
                          value={editData.game}
                          onChange={handleEditChange}
                        >
                          <option value="BGMI">BGMI</option>
                          <option value="PUBG">PUBG</option>
                          <option value="FREE FIRE">FREE FIRE</option>
                        </select>
                      </div>

                      <div>
                        <label className={styles.label}>Mode</label>
                        <select
                          className={styles.input}
                          name="mode"
                          value={editData.mode}
                          onChange={handleEditChange}
                        >
                          <option value="Solo">Solo</option>
                          <option value="Duo">Duo</option>
                          <option value="Squad">Squad</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.twoColumn}>
                      <div>
                        <label className={styles.label}>Entry Fee</label>
                        <input
                          className={styles.input}
                          type="number"
                          name="entryFee"
                          value={editData.entryFee}
                          onChange={handleEditChange}
                          min="0"
                        />
                      </div>

                      <div>
                        <label className={styles.label}>Prize Pool</label>
                        <input
                          className={styles.input}
                          type="number"
                          name="prizePool"
                          value={editData.prizePool}
                          onChange={handleEditChange}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className={styles.twoColumn}>
                      <div>
                        <label className={styles.label}>Max Teams</label>
                        <input
                          className={styles.input}
                          type="number"
                          name="maxTeams"
                          value={editData.maxTeams}
                          onChange={handleEditChange}
                          min="2"
                        />
                      </div>

                      <div>
                        <label className={styles.label}>Start Date</label>
                        <input
                          className={styles.input}
                          type="date"
                          name="startDate"
                          value={editData.startDate}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <Button
                        onClick={() => updateTournament(tournament._id)}
                        disabled={actionLoading === tournament._id}
                      >
                        {actionLoading === tournament._id
                          ? "Saving..."
                          : "Save"}
                      </Button>

                      <Button variant="secondary" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </section>
      )}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Tournament?"
        message={`Deleting ${deleteDialog.tournamentName} will also delete related match rooms, match results, and prize data.`}
        confirmLabel="Delete Tournament"
        variant="danger"
        loading={actionLoading === deleteDialog.tournamentId}
        onConfirm={confirmDeleteTournament}
        onCancel={closeDeleteDialog}
      />
    </main>
  );
};

export default ManageTournaments;
