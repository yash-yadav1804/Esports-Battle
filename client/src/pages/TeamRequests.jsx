import { useEffect, useState } from "react";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./TeamRequests.module.css";

const getUserId = (user) => {
  return user?._id || user?.id;
};

const TeamRequests = () => {
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem("user"));

  const [team, setTeam] = useState(null);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const refreshRequests = async (teamId) => {
    const requestsRes = await API.get(`/team-requests/team/${teamId}`);

    setRequests(
      requestsRes.data.requests ||
        requestsRes.data.teamRequests ||
        requestsRes.data ||
        [],
    );
  };

  useEffect(() => {
    let isMounted = true;

    const fetchTeamRequests = async () => {
      try {
        const teamRes = await API.get("/profile/my-team");
        const myTeam = teamRes.data.team;

        if (!isMounted) return;

        setTeam(myTeam);

        if (!myTeam) {
          return;
        }

        const iglId = myTeam.igl?._id || myTeam.igl;
        const currentUserId = getUserId(user);

        if (String(iglId) !== String(currentUserId)) {
          return;
        }

        const requestsRes = await API.get(`/team-requests/team/${myTeam._id}`);

        if (!isMounted) return;

        setRequests(
          requestsRes.data.requests ||
            requestsRes.data.teamRequests ||
            requestsRes.data ||
            [],
        );
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message || "Failed to fetch team requests",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTeamRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const approveRequest = async (requestId) => {
    try {
      setActionLoading(requestId);

      const res = await API.patch(`/team-requests/approve/${requestId}`);

      toast.success(res.data.message || "Request approved successfully");

      await refreshRequests(team._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading("");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      setActionLoading(requestId);

      const res = await API.patch(`/team-requests/reject/${requestId}`);

      toast.success(res.data.message || "Request rejected successfully");

      await refreshRequests(team._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading team requests"
          message="Fetching pending join requests for your team."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load requests" message={error} />
      </main>
    );
  }

  if (!team) {
    return (
      <main className={styles.page}>
        <EmptyState
          title="No team found"
          message="You need to create or join a team before managing requests."
          actionLabel="Create Team"
          actionTo="/teams/create"
        />
      </main>
    );
  }

  const iglId = team.igl?._id || team.igl;
  const currentUserId = getUserId(user);
  const isIgl = String(iglId) === String(currentUserId);

  if (!isIgl) {
    return (
      <main className={styles.page}>
        <ErrorState
          title="Access denied"
          message="Only the IGL or team captain can manage join requests."
        />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Captain Panel</p>
          <h1 className={styles.title}>Team Requests</h1>
          <p className={styles.subtitle}>
            Review players who want to join your team.
          </p>
        </div>

        <div className={styles.teamBadge}>
          Team: <strong>{team.teamName}</strong>
        </div>
      </section>

      {requests.length === 0 ? (
        <EmptyState
          title="No pending requests"
          message="New join requests will appear here when players request to join your team."
          actionLabel="View Teams"
          actionTo="/teams"
        />
      ) : (
        <section className={styles.grid}>
          {requests.map((request) => (
            <Card className={styles.requestCard} key={request._id}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>{request.player?.name || "Unknown Player"}</h2>
                  <p>{request.player?.email || "No email available"}</p>
                </div>

                <span className={styles.status}>{request.status}</span>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoBox}>
                  <span>IGN</span>
                  <strong>{request.player?.ign || "Not added"}</strong>
                </div>

                <div className={styles.infoBox}>
                  <span>BGMI UID</span>
                  <strong>{request.player?.bgmiUID || "Not added"}</strong>
                </div>
              </div>

              <div className={styles.actions}>
                <Button
                  onClick={() => approveRequest(request._id)}
                  disabled={actionLoading === request._id}
                >
                  {actionLoading === request._id ? "Processing..." : "Approve"}
                </Button>

                <Button
                  variant="danger"
                  onClick={() => rejectRequest(request._id)}
                  disabled={actionLoading === request._id}
                >
                  {actionLoading === request._id ? "Processing..." : "Reject"}
                </Button>
              </div>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
};

export default TeamRequests;
