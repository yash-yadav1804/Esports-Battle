import { useEffect, useState } from "react";
import API from "../api/axios";
import styles from "./TeamRequests.module.css";

const TeamRequests = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [team, setTeam] = useState(null);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const refreshRequests = async (teamId) => {
    const requestsRes = await API.get(`/team-requests/team/${teamId}`);
    setRequests(requestsRes.data.requests || requestsRes.data || []);
  };

  useEffect(() => {
    const fetchTeamRequests = async () => {
      try {
        const teamRes = await API.get("/profile/my-team");
        const myTeam = teamRes.data.team;

        setTeam(myTeam);

        if (!myTeam) {
          setLoading(false);
          return;
        }

        if (myTeam.igl?._id !== user?.id) {
          setLoading(false);
          return;
        }

        await refreshRequests(myTeam._id);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch team requests",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeamRequests();
  }, [user?.id]);

  const approveRequest = async (requestId) => {
    try {
      setActionLoading(requestId);

      const res = await API.patch(`/team-requests/approve/${requestId}`);

      alert(res.data.message || "Request approved");

      await refreshRequests(team._id);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading("");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      setActionLoading(requestId);

      const res = await API.patch(`/team-requests/reject/${requestId}`);

      alert(res.data.message || "Request rejected");

      await refreshRequests(team._id);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <h1>Loading team requests...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1>Error</h1>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1>No Team Found</h1>
          <p>You are not in any team yet.</p>
        </div>
      </div>
    );
  }

  if (team.igl?._id !== user?.id) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1>Access Denied</h1>
          <p>Only IGL can manage team join requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Team Requests</h1>
      <p className={styles.subtitle}>Team: {team.teamName}</p>

      {requests.length === 0 ? (
        <div className={styles.card}>
          <p>No pending requests found</p>
        </div>
      ) : (
        <div className={styles.list}>
          {requests.map((request) => (
            <div className={styles.card} key={request._id}>
              <h2>{request.player?.name}</h2>

              <p>Email: {request.player?.email}</p>
              <p>IGN: {request.player?.ign || "Not added"}</p>
              <p>BGMI UID: {request.player?.bgmiUID || "Not added"}</p>
              <p>Status: {request.status}</p>

              <div className={styles.actions}>
                <button
                  className={styles.approveBtn}
                  onClick={() => approveRequest(request._id)}
                  disabled={actionLoading === request._id}
                >
                  {actionLoading === request._id ? "Processing..." : "Approve"}
                </button>

                <button
                  className={styles.rejectBtn}
                  onClick={() => rejectRequest(request._id)}
                  disabled={actionLoading === request._id}
                >
                  {actionLoading === request._id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamRequests;
