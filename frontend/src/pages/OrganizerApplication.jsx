import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api/axios";
import { useToast } from "../components/ui/useToast";

import styles from "./OrganizerApplication.module.css";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

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

const getStatusText = (status) => {
  if (!status) return "No Request";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const OrganizerApplication = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  const [formData, setFormData] = useState({
    organizationName: "",
    contactNumber: "",
    reason: "",
    experience: "",
    socialLink: "",
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshingRole, setRefreshingRole] = useState(false);
  const [error, setError] = useState("");

  const latestRequest = useMemo(() => {
    return requests[0] || null;
  }, [requests]);

  const isOrganizer = currentUser?.role === "organizer";

  const hasPendingRequest = latestRequest?.status === "pending";
  const hasApprovedRequest = latestRequest?.status === "approved";
  const hasRejectedRequest = latestRequest?.status === "rejected";

  const canSubmitRequest =
    !isOrganizer && !hasPendingRequest && !hasApprovedRequest;

  useEffect(() => {
    let isMounted = true;

    const fetchMyRequests = async () => {
      try {
        const response = await API.get("/organizer-requests/my-requests");

        if (!isMounted) return;

        const data = getResponseData(response);
        setRequests(Array.isArray(data) ? data : []);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message || "Failed to load organizer requests",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!formData.organizationName.trim()) {
      toast.error("Organization name is required");
      return false;
    }

    if (!formData.contactNumber.trim()) {
      toast.error("Contact number is required");
      return false;
    }

    if (!phoneRegex.test(formData.contactNumber.trim())) {
      toast.error("Contact number must be 10 to 15 digits");
      return false;
    }

    if (!formData.reason.trim()) {
      toast.error("Reason is required");
      return false;
    }

    if (formData.reason.trim().length < 30) {
      toast.error("Reason should be at least 30 characters");
      return false;
    }

    return true;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        organizationName: formData.organizationName.trim(),
        contactNumber: formData.contactNumber.trim(),
        reason: formData.reason.trim(),
        experience: formData.experience.trim(),
        socialLink: formData.socialLink.trim(),
      };

      const response = await API.post("/organizer-requests/request", payload);
      const newRequest = getResponseData(response);

      setRequests((currentRequests) => [newRequest, ...currentRequests]);

      setFormData({
        organizationName: "",
        contactNumber: "",
        reason: "",
        experience: "",
        socialLink: "",
      });

      toast.success(response.data?.message || "Organizer request submitted");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit organizer request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const refreshUserRole = async () => {
    try {
      setRefreshingRole(true);

      const response = await API.get("/profile/me");
      const data = getResponseData(response);

      const updatedUser = data?.user || data;

      if (!updatedUser?._id) {
        throw new Error("Unable to refresh user profile");
      }

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      toast.success(`Role refreshed: ${updatedUser.role}`);

      if (updatedUser.role === "organizer") {
        navigate("/tournaments");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setRefreshingRole(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.stateCard}>
          <h1>Loading organizer application...</h1>
          <p>Checking your organizer request status.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Organizer Access</p>
        <h1 className={styles.title}>Organizer Application</h1>
        <p className={styles.subtitle}>
          Apply to become a tournament organizer. Once approved by an admin, you
          will be able to host tournaments and manage your own events.
        </p>
      </section>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.contentGrid}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>Application Form</p>
              <h2>Request Organizer Access</h2>
            </div>

            <span className={styles.roleBadge}>
              {currentUser?.role || "player"}
            </span>
          </div>

          {isOrganizer && (
            <div className={styles.successBox}>
              <strong>You are already an organizer.</strong>
              <p>You can now host tournaments and manage organizer features.</p>
            </div>
          )}

          {!isOrganizer && hasPendingRequest && (
            <div className={styles.pendingBox}>
              <strong>Your request is pending.</strong>
              <p>
                Admin will review your application. You cannot submit another
                request while one is pending.
              </p>
            </div>
          )}

          {!isOrganizer && hasApprovedRequest && (
            <div className={styles.successBox}>
              <strong>Your organizer request was approved.</strong>
              <p>
                Refresh your role to update local session data and unlock
                organizer access.
              </p>

              <button
                className={styles.secondaryButton}
                type="button"
                onClick={refreshUserRole}
                disabled={refreshingRole}
              >
                {refreshingRole ? "Refreshing Role..." : "Refresh Role"}
              </button>
            </div>
          )}

          {!isOrganizer && hasRejectedRequest && (
            <div className={styles.rejectedBox}>
              <strong>Your previous request was rejected.</strong>
              <p>
                You can improve your details and submit a new organizer
                application.
              </p>
            </div>
          )}

          {canSubmitRequest && (
            <form className={styles.form} onSubmit={handleSubmitRequest}>
              <div>
                <label className={styles.label} htmlFor="organizationName">
                  Organization / Brand Name
                </label>
                <input
                  id="organizationName"
                  className={styles.input}
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="Example: Yash Esports"
                />
              </div>

              <div>
                <label className={styles.label} htmlFor="contactNumber">
                  Contact Number
                </label>
                <input
                  id="contactNumber"
                  className={styles.input}
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Example: 9876543210"
                />
              </div>

              <div>
                <label className={styles.label} htmlFor="reason">
                  Why do you want organizer access?
                </label>
                <textarea
                  id="reason"
                  className={styles.textarea}
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Explain your purpose, tournament plan, audience, and why admin should approve you."
                />
              </div>

              <div>
                <label className={styles.label} htmlFor="experience">
                  Hosting Experience
                </label>
                <textarea
                  id="experience"
                  className={styles.textarea}
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Example: Hosted college custom rooms, local scrims, community events, etc."
                />
              </div>

              <div>
                <label className={styles.label} htmlFor="socialLink">
                  Social / Community Link
                </label>
                <input
                  id="socialLink"
                  className={styles.input}
                  type="text"
                  name="socialLink"
                  value={formData.socialLink}
                  onChange={handleChange}
                  placeholder="Instagram, Discord, WhatsApp group, YouTube, etc."
                />
              </div>

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting Application..."
                  : "Submit Organizer Application"}
              </button>
            </form>
          )}
        </section>

        <aside className={styles.sidePanel}>
          <div className={styles.statusCard}>
            <p className={styles.cardEyebrow}>Current Status</p>
            <h2>{getStatusText(latestRequest?.status)}</h2>

            <p>
              {latestRequest
                ? latestRequest.adminNote ||
                  "Your latest application status is shown here."
                : "You have not submitted an organizer application yet."}
            </p>

            {latestRequest && (
              <div className={styles.metaGrid}>
                <div>
                  <span>Submitted</span>
                  <strong>{formatDate(latestRequest.createdAt)}</strong>
                </div>

                <div>
                  <span>Reviewed</span>
                  <strong>{formatDate(latestRequest.reviewedAt)}</strong>
                </div>
              </div>
            )}
          </div>

          <div className={styles.infoCard}>
            <p className={styles.cardEyebrow}>Organizer Permissions</p>

            <div className={styles.permissionList}>
              <div>
                <strong>Can create tournaments</strong>
                <p>Approved organizers can host their own tournaments.</p>
              </div>

              <div>
                <strong>Can manage own events</strong>
                <p>Organizer access should be limited to owned tournaments.</p>
              </div>

              <div>
                <strong>Cannot manage platform users</strong>
                <p>User deletion and admin-level controls remain restricted.</p>
              </div>
            </div>
          </div>

          <div className={styles.historyCard}>
            <p className={styles.cardEyebrow}>Request History</p>

            {requests.length === 0 ? (
              <p className={styles.mutedText}>No organizer requests found.</p>
            ) : (
              <div className={styles.historyList}>
                {requests.map((request) => (
                  <div className={styles.historyItem} key={request._id}>
                    <div>
                      <strong>{request.organizationName}</strong>
                      <p>{formatDate(request.createdAt)}</p>
                    </div>

                    <span
                      className={`${styles.statusPill} ${styles[request.status]}`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
};

export default OrganizerApplication;
