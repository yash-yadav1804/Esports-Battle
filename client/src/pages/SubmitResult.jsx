import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./SubmitResult.module.css";

const getTournamentId = (tournament) => {
  return tournament?._id || tournament?.id;
};

const getRoomId = (room) => {
  return room?._id || room?.id;
};

const getRoomTournamentId = (room) => {
  return (
    room?.tournament?._id ||
    room?.tournament ||
    room?.tournamentId?._id ||
    room?.tournamentId
  );
};

const getRoomLabel = (room) => {
  const matchNumber = room?.matchNumber || room?.matchNo || "N/A";
  const roomId = room?.roomId || room?.roomCode || "N/A";

  return `Match #${matchNumber} — Room ${roomId}`;
};

const SubmitResult = () => {
  const toast = useToast();

  const [tournaments, setTournaments] = useState([]);
  const [matchRooms, setMatchRooms] = useState([]);

  const [formData, setFormData] = useState({
    tournamentId: "",
    matchRoomId: "",
    kills: "",
    position: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedTournament = useMemo(() => {
    return tournaments.find(
      (tournament) =>
        String(getTournamentId(tournament)) === formData.tournamentId,
    );
  }, [tournaments, formData.tournamentId]);

  const filteredMatchRooms = useMemo(() => {
    if (!formData.tournamentId) return [];

    return matchRooms.filter((room) => {
      return (
        String(getRoomTournamentId(room)) === String(formData.tournamentId)
      );
    });
  }, [matchRooms, formData.tournamentId]);

  useEffect(() => {
    let isMounted = true;

    const fetchSubmitData = async () => {
      try {
        const [tournamentsRes, matchRoomsRes] = await Promise.all([
          API.get("/profile/my-tournaments"),
          API.get("/matchrooms"),
        ]);

        if (!isMounted) return;

        const tournamentData =
          tournamentsRes.data.tournaments ||
          tournamentsRes.data.myTournaments ||
          tournamentsRes.data ||
          [];

        const matchRoomData =
          matchRoomsRes.data.matchRooms ||
          matchRoomsRes.data.rooms ||
          matchRoomsRes.data ||
          [];

        setTournaments(Array.isArray(tournamentData) ? tournamentData : []);
        setMatchRooms(Array.isArray(matchRoomData) ? matchRoomData : []);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message ||
            "Failed to load tournaments and match rooms",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSubmitData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => {
      if (name === "tournamentId") {
        return {
          ...currentData,
          tournamentId: value,
          matchRoomId: "",
        };
      }

      return {
        ...currentData,
        [name]: value,
      };
    });
  };

  const validateForm = () => {
    if (!formData.tournamentId) {
      toast.error("Please select a tournament");
      return false;
    }

    if (!formData.matchRoomId) {
      toast.error("Please select a match room");
      return false;
    }

    if (formData.kills === "" || Number(formData.kills) < 0) {
      toast.error("Please enter valid kills");
      return false;
    }

    if (!formData.position || Number(formData.position) <= 0) {
      toast.error("Please enter a valid position");
      return false;
    }

    return true;
  };

  const submitResult = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        tournamentId: formData.tournamentId,
        matchRoomId: formData.matchRoomId,
        kills: Number(formData.kills),
        position: Number(formData.position),
      };

      const res = await API.post("/result-submissions/submit", payload);

      toast.success(res.data.message || "Result submitted for admin review");

      setFormData({
        tournamentId: "",
        matchRoomId: "",
        kills: "",
        position: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit result");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading submit form"
          message="Fetching your registered tournaments and match rooms."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load result form" message={error} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Player Match Report</p>
        <h1 className={styles.title}>Submit Match Result</h1>
        <p className={styles.subtitle}>
          Submit your team&apos;s kills and placement for admin verification.
          Once approved, points will be added to the leaderboard.
        </p>
      </section>

      {tournaments.length === 0 ? (
        <EmptyState
          title="No registered tournaments"
          message="Your team must register in a tournament before you can submit a result."
          actionLabel="View Tournaments"
          actionTo="/tournaments"
        />
      ) : (
        <section className={styles.contentGrid}>
          <Card className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>Result Details</p>
                <h2>Match Performance</h2>
              </div>

              <span className={styles.reviewBadge}>Admin Review</span>
            </div>

            <form className={styles.form} onSubmit={submitResult}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="tournamentId">
                  Tournament
                </label>

                <select
                  id="tournamentId"
                  className={styles.input}
                  name="tournamentId"
                  value={formData.tournamentId}
                  onChange={handleChange}
                >
                  <option value="">Select tournament</option>

                  {tournaments.map((tournament) => (
                    <option
                      key={getTournamentId(tournament)}
                      value={getTournamentId(tournament)}
                    >
                      {tournament.title} — {tournament.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="matchRoomId">
                  Match Room
                </label>

                <select
                  id="matchRoomId"
                  className={styles.input}
                  name="matchRoomId"
                  value={formData.matchRoomId}
                  onChange={handleChange}
                  disabled={!formData.tournamentId}
                >
                  <option value="">
                    {formData.tournamentId
                      ? "Select match room"
                      : "Select tournament first"}
                  </option>

                  {filteredMatchRooms.map((room) => (
                    <option key={getRoomId(room)} value={getRoomId(room)}>
                      {getRoomLabel(room)}
                    </option>
                  ))}
                </select>

                {formData.tournamentId && filteredMatchRooms.length === 0 && (
                  <p className={styles.helperText}>
                    No match room found for this tournament yet.
                  </p>
                )}
              </div>

              <div className={styles.twoColumn}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="kills">
                    Kills
                  </label>

                  <input
                    id="kills"
                    className={styles.input}
                    type="number"
                    name="kills"
                    min="0"
                    value={formData.kills}
                    onChange={handleChange}
                    placeholder="Example: 8"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="position">
                    Position
                  </label>

                  <input
                    id="position"
                    className={styles.input}
                    type="number"
                    name="position"
                    min="1"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Example: 1"
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Result"}
              </Button>
            </form>
          </Card>

          <aside className={styles.sidePanel}>
            <Card className={styles.selectedCard}>
              <p className={styles.cardEyebrow}>Selected Tournament</p>

              {selectedTournament ? (
                <>
                  <h2>{selectedTournament.title}</h2>
                  <p className={styles.sideMeta}>
                    {selectedTournament.game} • {selectedTournament.mode}
                  </p>

                  <div className={styles.miniGrid}>
                    <div>
                      <span>Status</span>
                      <strong>{selectedTournament.status}</strong>
                    </div>

                    <div>
                      <span>Prize Pool</span>
                      <strong>₹{selectedTournament.prizePool || 0}</strong>
                    </div>

                    <div>
                      <span>Entry Fee</span>
                      <strong>₹{selectedTournament.entryFee || 0}</strong>
                    </div>

                    <div>
                      <span>Rooms</span>
                      <strong>{filteredMatchRooms.length}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <p className={styles.sideMeta}>
                  Select a tournament to see its quick details here.
                </p>
              )}
            </Card>

            <Card className={styles.rulesCard}>
              <p className={styles.cardEyebrow}>Scoring Rules</p>
              <h2>How points are calculated</h2>

              <div className={styles.rulesList}>
                <div>
                  <span>Kill Points</span>
                  <strong>2 points per kill</strong>
                </div>

                <div>
                  <span>1st Position</span>
                  <strong>15 placement points</strong>
                </div>

                <div>
                  <span>2nd Position</span>
                  <strong>12 placement points</strong>
                </div>

                <div>
                  <span>3rd Position</span>
                  <strong>10 placement points</strong>
                </div>
              </div>
            </Card>

            <Card className={styles.processCard}>
              <p className={styles.cardEyebrow}>Review Process</p>

              <div className={styles.timeline}>
                <div>
                  <span>1</span>
                  <p>Player submits kills and position.</p>
                </div>

                <div>
                  <span>2</span>
                  <p>Admin reviews submitted result.</p>
                </div>

                <div>
                  <span>3</span>
                  <p>Approved result updates leaderboard.</p>
                </div>
              </div>
            </Card>
          </aside>
        </section>
      )}
    </main>
  );
};

export default SubmitResult;
