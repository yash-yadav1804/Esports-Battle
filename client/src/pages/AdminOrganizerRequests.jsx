import { useEffect, useState } from "react";
import API from "../api/axios";
import { useToast } from "../components/ui/useToast";
import styles from "./AdminOrganizerRequests.module.css";
const getResponseData = (response) => {
  return response.data?.data || response.data;
};
const formatDate = (dateValue) => {
  if (!dateValue) return "Not available";
  return new Date(dateValue).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const AdminOrganizerRequests = () => {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let isMounted = true;
    const loadPendingRequests = async () => {
      try {
        const response = await API.get("/organizer-requests/pending");
        if (!isMounted) return;
        const data = getResponseData(response);
        setRequests(Array.isArray(data) ? data : []);
        setError("");
      } catch (error) {
        if (!isMounted) return;
        setError(
          error.response?.data?.message ||
            "Failed to load pending organizer requests",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadPendingRequests();
    return () => {
      isMounted = false;
    };
  }, []);
  const refreshRequests = async () => {
    const response = await API.get("/organizer-requests/pending");
    const data = getResponseData(response);
    setRequests(Array.isArray(data) ? data : []);
  };
  const handleNoteChange = (requestId, value) => {
    setNotes((currentNotes) => ({ ...currentNotes, [requestId]: value }));
  };
  const approveRequest = async (requestId) => {
    try {
      setReviewingId(requestId);
      const response = await API.patch(
        `/organizer-requests/approve/${requestId}`,
        { adminNote: notes[requestId] || "" },
      );
      toast.success(response.data?.message || "Organizer request approved");
      setNotes((currentNotes) => {
        const updatedNotes = { ...currentNotes };
        delete updatedNotes[requestId];
        return updatedNotes;
      });
      await refreshRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setReviewingId("");
    }
  };
  const rejectRequest = async (requestId) => {
    try {
      setReviewingId(requestId);
      const response = await API.patch(
        `/organizer-requests/reject/${requestId}`,
        { adminNote: notes[requestId] || "" },
      );
      toast.success(response.data?.message || "Organizer request rejected");
      setNotes((currentNotes) => {
        const updatedNotes = { ...currentNotes };
        delete updatedNotes[requestId];
        return updatedNotes;
      });
      await refreshRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setReviewingId("");
    }
  };
  if (loading) {
    return (
      <main className={styles.page}>
        {" "}
        <div className={styles.stateCard}>
          {" "}
          <h1>Loading organizer requests...</h1>{" "}
          <p>Fetching pending organizer applications for admin review.</p>{" "}
        </div>{" "}
      </main>
    );
  }
  return (
    <main className={styles.page}>
      {" "}
      <section className={styles.header}>
        {" "}
        <p className={styles.eyebrow}>Admin Review</p>{" "}
        <h1 className={styles.title}>Organizer Requests</h1>{" "}
        <p className={styles.subtitle}>
          {" "}
          Review players who want organizer access. Approving a request upgrades
          the user role from player to organizer.{" "}
        </p>{" "}
      </section>{" "}
      {error && <p className={styles.error}>{error}</p>}{" "}
      {requests.length === 0 ? (
        <div className={styles.emptyBox}>
          {" "}
          <h2>No pending requests</h2>{" "}
          <p>All organizer applications have been reviewed.</p>{" "}
        </div>
      ) : (
        <section className={styles.grid}>
          {" "}
          {requests.map((request) => (
            <article className={styles.card} key={request._id}>
              {" "}
              <div className={styles.cardTop}>
                {" "}
                <div>
                  {" "}
                  <p className={styles.cardEyebrow}>
                    Organizer Application
                  </p>{" "}
                  <h2>{request.organizationName}</h2>{" "}
                  <p className={styles.dateText}>
                    {" "}
                    Submitted: {formatDate(request.createdAt)}{" "}
                  </p>{" "}
                </div>{" "}
                <span className={styles.statusBadge}>
                  {request.status}
                </span>{" "}
              </div>{" "}
              <div className={styles.userBox}>
                {" "}
                <div className={styles.avatar}>
                  {" "}
                  {request.user?.name?.charAt(0)?.toUpperCase() || "U"}{" "}
                </div>{" "}
                <div>
                  {" "}
                  <strong>{request.user?.name || "Unknown User"}</strong>{" "}
                  <p>{request.user?.email || "Email not available"}</p>{" "}
                  <p>
                    {" "}
                    IGN: {request.user?.ign || "N/A"} • UID:{" "}
                    {request.user?.bgmiUID || "N/A"}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className={styles.infoGrid}>
                {" "}
                <div>
                  {" "}
                  <span>Contact Number</span>{" "}
                  <strong>{request.contactNumber}</strong>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <span>Social Link</span>{" "}
                  <strong>{request.socialLink || "Not provided"}</strong>{" "}
                </div>{" "}
              </div>{" "}
              <div className={styles.textBlock}>
                {" "}
                <span>Reason</span> <p>{request.reason}</p>{" "}
              </div>{" "}
              <div className={styles.textBlock}>
                {" "}
                <span>Hosting Experience</span>{" "}
                <p>{request.experience || "Not provided"}</p>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className={styles.label} htmlFor={`note-${request._id}`}>
                  {" "}
                  Admin Note{" "}
                </label>{" "}
                <textarea
                  id={`note-${request._id}`}
                  className={styles.textarea}
                  value={notes[request._id] || ""}
                  onChange={(e) =>
                    handleNoteChange(request._id, e.target.value)
                  }
                  placeholder="Optional note for approval or rejection"
                />{" "}
              </div>{" "}
              <div className={styles.actions}>
                {" "}
                <button
                  className={styles.approveBtn}
                  type="button"
                  onClick={() => approveRequest(request._id)}
                  disabled={reviewingId === request._id}
                >
                  {" "}
                  {reviewingId === request._id
                    ? "Processing..."
                    : "Approve"}{" "}
                </button>{" "}
                <button
                  className={styles.rejectBtn}
                  type="button"
                  onClick={() => rejectRequest(request._id)}
                  disabled={reviewingId === request._id}
                >
                  {" "}
                  Reject{" "}
                </button>{" "}
              </div>{" "}
            </article>
          ))}{" "}
        </section>
      )}{" "}
    </main>
  );
};
export default AdminOrganizerRequests;
