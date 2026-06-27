import { useEffect, useState } from "react";
import API from "../api/axios";

import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";

import styles from "./MySubmissions.module.css";

const getStatusVariant = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";

  return "warning";
};

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMySubmissions = async () => {
      try {
        const res = await API.get("/result-submissions/my-submissions");

        if (!isMounted) return;

        setSubmissions(res.data.submissions || []);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message || "Failed to fetch submissions",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMySubmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading submissions"
          message="Fetching your submitted match results."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load submissions" message={error} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Player Results</p>
        <h1 className={styles.title}>My Submissions</h1>
        <p className={styles.subtitle}>
          Track your submitted match results and see whether they are pending,
          approved, or rejected by admin.
        </p>
      </section>

      {submissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          message="Submit your match result after playing a tournament match."
          actionLabel="Submit Result"
          actionTo="/submit-result"
        />
      ) : (
        <section className={styles.grid}>
          {submissions.map((submission) => (
            <Card className={styles.submissionCard} key={submission._id}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.matchLabel}>
                    Match #{submission.matchRoom?.matchNumber || "N/A"}
                  </p>

                  <h2>
                    {submission.tournament?.title || "Unknown Tournament"}
                  </h2>

                  <p className={styles.meta}>
                    Team: {submission.team?.teamName || "Unknown Team"}
                  </p>
                </div>

                <Badge variant={getStatusVariant(submission.status)}>
                  {submission.status}
                </Badge>
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
                  <span>Game</span>
                  <strong>{submission.tournament?.game || "BGMI"}</strong>
                </div>
              </div>

              {submission.adminNote && (
                <div className={styles.noteBox}>
                  <strong>Admin Note</strong>
                  <p>{submission.adminNote}</p>
                </div>
              )}

              <p className={styles.date}>
                Submitted on:{" "}
                {submission.createdAt
                  ? new Date(submission.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
};

export default MySubmissions;
