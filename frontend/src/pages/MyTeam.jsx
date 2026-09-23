import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./MyTeam.module.css";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const getTeamData = (response) => {
  return response.data?.team || response.data?.data?.team || response.data;
};

const getUserId = (user) => {
  return user?._id || user?.id;
};

const MyTeam = () => {
  const toast = useToast();
  const currentUser = getStoredUser();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const currentUserId = getUserId(currentUser);
  const iglId = team?.igl?._id || team?.igl;
  const isCaptain = team && String(iglId) === String(currentUserId);

  const fetchMyTeam = async () => {
    const response = await API.get("/teams/my-team");
    const teamData = getTeamData(response);

    setTeam(teamData || null);
  };

  useEffect(() => {
    let isMounted = true;

    const loadMyTeam = async () => {
      try {
        const response = await API.get("/teams/my-team");

        if (!isMounted) return;

        const teamData = getTeamData(response);

        setTeam(teamData || null);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(error.response?.data?.message || "Failed to fetch your team");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMyTeam();

    return () => {
      isMounted = false;
    };
  }, []);

  const leaveTeam = async () => {
    try {
      setActionLoading("leave");

      const response = await API.patch("/teams/leave");

      toast.success(response.data.message || "You left the team successfully");

      await fetchMyTeam();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave team");
    } finally {
      setActionLoading("");
    }
  };

  const removePlayer = async (playerId) => {
    try {
      setActionLoading(playerId);

      const response = await API.patch(`/teams/remove-player/${playerId}`);

      toast.success(response.data.message || "Player removed successfully");

      await fetchMyTeam();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove player");
    } finally {
      setActionLoading("");
    }
  };

  const transferCaptain = async (playerId) => {
    try {
      setActionLoading(`captain-${playerId}`);

      const response = await API.patch(`/teams/transfer-captain/${playerId}`);

      toast.success(response.data.message || "Captaincy transferred");

      await fetchMyTeam();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to transfer captaincy",
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading your team"
          message="Fetching your squad details."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load team" message={error} />
      </main>
    );
  }

  if (!team) {
    return (
      <main className={styles.page}>
        <EmptyState
          title="You are not in any team"
          message="Create your own team or send a join request to another team."
          actionLabel="View Teams"
          actionTo="/teams"
        />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Squad Control</p>
          <h1 className={styles.title}>My Team</h1>
          <p className={styles.subtitle}>
            View your team members, captain, and manage your squad.
          </p>
        </div>

        {isCaptain && (
          <Link className={styles.requestButton} to="/team-requests">
            View Join Requests
          </Link>
        )}
      </section>

      <Card className={styles.teamCard}>
        <div className={styles.teamHeader}>
          <div>
            <p className={styles.label}>Team Name</p>
            <h2>{team.teamName}</h2>
          </div>

          <span className={styles.badge}>
            {team.players?.length || 0}/{team.maxPlayers || 4} Players
          </span>
        </div>

        <div className={styles.captainBox}>
          <span>Captain / IGL</span>
          <strong>{team.igl?.name || "Unknown Captain"}</strong>
          <p>{team.igl?.email || "No email available"}</p>
        </div>
      </Card>

      <section className={styles.memberSection}>
        <h2>Team Members</h2>

        <div className={styles.grid}>
          {team.players?.map((player) => {
            const playerId = getUserId(player);
            const isCurrentPlayer = String(playerId) === String(currentUserId);
            const isPlayerCaptain = String(playerId) === String(iglId);

            return (
              <Card className={styles.memberCard} key={playerId}>
                <div className={styles.memberTop}>
                  <div className={styles.avatar}>
                    {player.name?.charAt(0)?.toUpperCase() || "P"}
                  </div>

                  <div>
                    <h3>{player.name || "Unknown Player"}</h3>
                    <p>{player.email || "No email available"}</p>
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoBox}>
                    <span>IGN</span>
                    <strong>{player.ign || "Not added"}</strong>
                  </div>

                  <div className={styles.infoBox}>
                    <span>BGMI UID</span>
                    <strong>{player.bgmiUID || "Not added"}</strong>
                  </div>
                </div>

                <div className={styles.roleRow}>
                  {isPlayerCaptain && (
                    <span className={styles.captainBadge}>Captain</span>
                  )}

                  {isCurrentPlayer && (
                    <span className={styles.youBadge}>You</span>
                  )}
                </div>

                {isCaptain && !isCurrentPlayer && (
                  <div className={styles.actions}>
                    <Button
                      onClick={() => transferCaptain(playerId)}
                      disabled={actionLoading === `captain-${playerId}`}
                    >
                      {actionLoading === `captain-${playerId}`
                        ? "Transferring..."
                        : "Make Captain"}
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => removePlayer(playerId)}
                      disabled={actionLoading === playerId}
                    >
                      {actionLoading === playerId ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <div className={styles.leaveBox}>
        <div>
          <h2>Leave Team</h2>
          <p>
            If you leave as captain, captaincy will be transferred to another
            player automatically.
          </p>
        </div>

        <Button
          variant="danger"
          onClick={leaveTeam}
          disabled={actionLoading === "leave"}
        >
          {actionLoading === "leave" ? "Leaving..." : "Leave Team"}
        </Button>
      </div>
    </main>
  );
};

export default MyTeam;
