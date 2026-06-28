import { useCallback, useEffect, useState } from "react";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./PendingResults.module.css";

const getSubmissionId = (submission) => {
  return submission?._id || submission?.id;
};

const getTeamName = (submission) => {
  return submission?.team?.teamName || submission?.teamName || "Unknown Team";
};

const getTournamentName = (submission) => {
  return (
    submission?.tournament?.title ||
    submission?.tournamentName ||
    "Unknown Tournament"
  );
};

const getMatchRoomName = (submission) => {
  return (
    submission?.matchRoom?.roomName ||
    submission?.matchRoom?.title ||
    submission?.matchRoomName ||
    "Match Room"
  );
};

const PendingResults = () => {
  const toast = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    submissionId: "",
    teamName: "",
    adminNote: "",
  });

  const fetchPendingSubmissions = useCallback(async () => {
    try {
      const res = await API.get("/result-submissions/pending");

      const data =
        res.data.submissions ||
        res.data.pendingSubmissions ||
        res.data.results ||
        res.data ||
        [];

      setSubmissions(Array.isArray(data) ? data : []);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch pending submissions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingSubmissions();
  }, [fetchPendingSubmissions]);

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

  const openRejectModal = (submission) => {
    setRejectModal({
      isOpen: true,
      submissionId: getSubmissionId(submission),
      teamName: getTeamName(submission),
      adminNote: "",
    });
  };

  const closeRejectModal = () => {
    setRejectModal({
      isOpen: false,
      submissionId: "",
      teamName: "",
      adminNote: "",
    });
  };

  const handleRejectNoteChange = (e) => {
    setRejectModal((currentModal) => ({
      ...currentModal,
      adminNote: e.target.value,
    }));
  };

  const rejectSubmission = async () => {
    if (!rejectModal.adminNote.trim()) {
      toast.error("Please add a rejection reason");
      return;
    }

    try {
      setActionLoading(rejectModal.submissionId);

      const res = await API.patch(
        `/result-submissions/reject/${rejectModal.submissionId}`,
        {
          adminNote: rejectModal.adminNote.trim(),
        },
      );

      toast.success(res.data.message || "Result rejected successfully");

      closeRejectModal();
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
          message="Fetching player result submissions for admin review."
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
        <p className={styles.eyebrow}>Admin Result Review</p>
        <h1 className={styles.title}>Pending Results</h1>
        <p className={styles.subtitle}>
          Review submitted kills and placement before adding results to the
          final leaderboard.
        </p>
      </section>

      {submissions.length === 0 ? (
        <EmptyState
          title="No pending submissions"
          message="Player result submissions waiting for approval will appear here."
        />
      ) : (
        <section className={styles.grid}>
          {submissions.map((submission) => {
            const submissionId = getSubmissionId(submission);

            return (
              <Card className={styles.resultCard} key={submissionId}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.status}>Pending Review</p>
                    <h2>{getTeamName(submission)}</h2>
                    <p className={styles.meta}>
                      {getTournamentName(submission)} •{" "}
                      {getMatchRoomName(submission)}
                    </p>
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statBox}>
                    <span>Kills</span>
                    <strong>{submission.kills ?? 0}</strong>
                  </div>

                  <div className={styles.statBox}>
                    <span>Position</span>
                    <strong>#{submission.position ?? "N/A"}</strong>
                  </div>

                  <div className={styles.statBox}>
                    <span>Status</span>
                    <strong>{submission.status || "pending"}</strong>
                  </div>

                  <div className={styles.statBox}>
                    <span>Submitted At</span>
                    <strong>
                      {submission.createdAt
                        ? new Date(submission.createdAt).toLocaleDateString()
                        : "N/A"}
                    </strong>
                  </div>
                </div>

                {submission.submittedBy && (
                  <div className={styles.submittedBy}>
                    <span>Submitted By</span>
                    <strong>
                      {submission.submittedBy?.name ||
                        submission.submittedBy?.email ||
                        "Player"}
                    </strong>
                  </div>
                )}

                <div className={styles.actions}>
                  <Button
                    onClick={() => approveSubmission(submissionId)}
                    disabled={actionLoading === submissionId}
                  >
                    {actionLoading === submissionId
                      ? "Approving..."
                      : "Approve"}
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => openRejectModal(submission)}
                    disabled={actionLoading === submissionId}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {rejectModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.rejectModal}>
            <div className={styles.modalIcon}>!</div>

            <h2>Reject Result?</h2>

            <p>
              Add a clear reason for rejecting{" "}
              <strong>{rejectModal.teamName}</strong> result submission.
            </p>

            <label className={styles.label}>Rejection Note</label>

            <textarea
              className={styles.textarea}
              value={rejectModal.adminNote}
              onChange={handleRejectNoteChange}
              placeholder="Example: Kill count proof was unclear or placement does not match match record."
              rows="5"
            />

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={closeRejectModal}
                disabled={actionLoading === rejectModal.submissionId}
              >
                Cancel
              </button>

              <button
                className={styles.rejectBtn}
                onClick={rejectSubmission}
                disabled={actionLoading === rejectModal.submissionId}
              >
                {actionLoading === rejectModal.submissionId
                  ? "Rejecting..."
                  : "Reject Result"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PendingResults;
