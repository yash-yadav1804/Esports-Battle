import { useEffect, useState } from "react";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./PendingResults.module.css";

const PendingResults = () => {
  const toast = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const fetchPendingSubmissions = async () => {
    try {
      const res = await API.get("/result-submissions/pending");

      setSubmissions(res.data.submissions || []);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch pending results",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadSubmissions = async () => {
      try {
        const res = await API.get("/result-submissions/pending");

        if (!isMounted) return;

        setSubmissions(res.data.submissions || []);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message || "Failed to fetch pending results",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSubmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  const approveSubmission = async (submissionId) => {
    try {
      setActionLoading(submissionId);

      const res = await API.patch(
        `/result-submissions/approve/${submissionId}`,
      );

      toast.success(res.data.message || "Result approved successfully");

      await fetchPendingSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve result");
    } finally {
      setActionLoading("");
    }
  };

  const rejectSubmission = async (submissionId) => {
    const adminNote = window.prompt(
      "Reason for rejection?",
      "Submitted result could not be verified.",
    );

    if (adminNote === null) return;

    try {
      setActionLoading(submissionId);

      const res = await API.patch(
        `/result-submissions/reject/${submissionId}`,
        {
          adminNote,
        },
      );

      toast.success(res.data.message || "Result rejected successfully");

      await fetchPendingSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject result");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading pending results"
          message="Fetching result submissions waiting for admin approval."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load pending results" message={error} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Admin Verification</p>
        <h1 className={styles.title}>Pending Results</h1>
        <p className={styles.subtitle}>
          Review submitted kills and placement. Approved results will create
          match results and update the leaderboard.
        </p>
      </section>

      {submissions.length === 0 ? (
        <EmptyState
          title="No pending results"
          message="Player result submissions will appear here after they submit match performance."
          actionLabel="View Match Rooms"
          actionTo="/match-rooms"
        />
      ) : (
        <section className={styles.grid}>
          {submissions.map((submission) => (
            <Card className={styles.resultCard} key={submission._id}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.matchLabel}>
                    Match #{submission.matchRoom?.matchNumber || "N/A"}
                  </p>

                  <h2>{submission.team?.teamName || "Unknown Team"}</h2>

                  <p className={styles.meta}>
                    {submission.tournament?.title || "Unknown Tournament"}
                  </p>
                </div>

                <span className={styles.status}>{submission.status}</span>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoBox}>
                  <span>Kills</span>
                  <strong>{submission.kills}</strong>
                </div>

                <div className={styles.infoBox}>
                  <span>Position</span>
                  <strong>#{submission.position}</strong>
                </div>

                <div className={styles.infoBox}>
                  <span>Room ID</span>
                  <strong>{submission.matchRoom?.roomId || "N/A"}</strong>
                </div>

                <div className={styles.infoBox}>
                  <span>Submitted By</span>
                  <strong>{submission.submittedBy?.name || "Unknown"}</strong>
                </div>
              </div>

              <div className={styles.playerBox}>
                <p>
                  <strong>Email:</strong>{" "}
                  {submission.submittedBy?.email || "Not available"}
                </p>

                <p>
                  <strong>IGN:</strong>{" "}
                  {submission.submittedBy?.ign || "Not added"}
                </p>

                <p>
                  <strong>BGMI UID:</strong>{" "}
                  {submission.submittedBy?.bgmiUID || "Not added"}
                </p>
              </div>

              <div className={styles.actions}>
                <Button
                  onClick={() => approveSubmission(submission._id)}
                  disabled={actionLoading === submission._id}
                >
                  {actionLoading === submission._id
                    ? "Processing..."
                    : "Approve"}
                </Button>

                <Button
                  variant="danger"
                  onClick={() => rejectSubmission(submission._id)}
                  disabled={actionLoading === submission._id}
                >
                  {actionLoading === submission._id
                    ? "Processing..."
                    : "Reject"}
                </Button>
              </div>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
};

export default PendingResults;
