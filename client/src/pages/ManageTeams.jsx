import { useEffect, useState } from "react";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./ManageTeams.module.css";

const ManageTeams = () => {
  const toast = useToast();

  const [teams, setTeams] = useState([]);
  const [editingTeamId, setEditingTeamId] = useState("");
  const [editData, setEditData] = useState({
    teamName: "",
    maxPlayers: "",
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const fetchTeams = async () => {
    try {
      const res = await API.get("/teams");

      setTeams(res.data || []);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTeams = async () => {
      try {
        const res = await API.get("/teams");

        if (!isMounted) return;

        setTeams(res.data || []);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(error.response?.data?.message || "Failed to fetch teams");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTeams();

    return () => {
      isMounted = false;
    };
  }, []);

  const startEditing = (team) => {
    setEditingTeamId(team._id);

    setEditData({
      teamName: team.teamName || "",
      maxPlayers: team.maxPlayers || "",
    });
  };

  const cancelEditing = () => {
    setEditingTeamId("");

    setEditData({
      teamName: "",
      maxPlayers: "",
    });
  };

  const handleEditChange = (e) => {
    setEditData((currentData) => ({
      ...currentData,
      [e.target.name]: e.target.value,
    }));
  };

  const updateTeam = async (teamId) => {
    try {
      setActionLoading(teamId);

      const payload = {
        teamName: editData.teamName.trim(),
        maxPlayers: Number(editData.maxPlayers),
      };

      const res = await API.patch(`/admin/teams/${teamId}`, payload);

      toast.success(res.data.message || "Team updated successfully");

      cancelEditing();
      await fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update team");
    } finally {
      setActionLoading("");
    }
  };

  const deleteTeam = async (teamId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this team?",
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(teamId);

      const res = await API.delete(`/admin/teams/${teamId}`);

      toast.success(res.data.message || "Team deleted successfully");

      await fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete team");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading teams"
          message="Fetching all teams for admin management."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load teams" message={error} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Admin Team Control</p>
        <h1 className={styles.title}>Manage Teams</h1>
        <p className={styles.subtitle}>
          View, update, and delete teams created by players on the platform.
        </p>
      </section>

      {teams.length === 0 ? (
        <EmptyState
          title="No teams found"
          message="Teams created by players will appear here."
          actionLabel="Create Team"
          actionTo="/teams/create"
        />
      ) : (
        <section className={styles.grid}>
          {teams.map((team) => {
            const isEditing = editingTeamId === team._id;

            return (
              <Card className={styles.teamCard} key={team._id}>
                {!isEditing ? (
                  <>
                    <div className={styles.cardHeader}>
                      <div>
                        <p className={styles.teamLabel}>Team</p>
                        <h2>{team.teamName}</h2>
                        <p className={styles.meta}>
                          Players: {team.players?.length || 0}/
                          {team.maxPlayers || 4}
                        </p>
                      </div>
                    </div>

                    <div className={styles.infoGrid}>
                      <div className={styles.infoBox}>
                        <span>IGL</span>
                        <strong>
                          {team.igl?.name || team.igl || "Not available"}
                        </strong>
                      </div>

                      <div className={styles.infoBox}>
                        <span>Total Players</span>
                        <strong>{team.players?.length || 0}</strong>
                      </div>

                      <div className={styles.infoBox}>
                        <span>Max Players</span>
                        <strong>{team.maxPlayers || 4}</strong>
                      </div>

                      <div className={styles.infoBox}>
                        <span>Created</span>
                        <strong>
                          {team.createdAt
                            ? new Date(team.createdAt).toLocaleDateString()
                            : "N/A"}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <Button
                        variant="secondary"
                        onClick={() => startEditing(team)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => deleteTeam(team._id)}
                        disabled={actionLoading === team._id}
                      >
                        {actionLoading === team._id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className={styles.editTitle}>Edit Team</h2>

                    <label className={styles.label}>Team Name</label>
                    <input
                      className={styles.input}
                      type="text"
                      name="teamName"
                      value={editData.teamName}
                      onChange={handleEditChange}
                    />

                    <label className={styles.label}>Max Players</label>
                    <input
                      className={styles.input}
                      type="number"
                      name="maxPlayers"
                      value={editData.maxPlayers}
                      onChange={handleEditChange}
                      min="1"
                    />

                    <div className={styles.actions}>
                      <Button
                        onClick={() => updateTeam(team._id)}
                        disabled={actionLoading === team._id}
                      >
                        {actionLoading === team._id ? "Saving..." : "Save"}
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
    </main>
  );
};

export default ManageTeams;
