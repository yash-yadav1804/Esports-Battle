import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./CreateMatchRoom.module.css";

const getTournamentId = (tournament) => {
  return tournament?._id || tournament?.id;
};

const CreateMatchRoom = () => {
  const toast = useToast();

  const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({
    tournamentId: "",
    matchNumber: "",
    map: "Erangel",
    roomId: "",
    roomPassword: "",
    matchTime: "",
  });

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const selectedTournament = useMemo(() => {
    return tournaments.find(
      (tournament) =>
        String(getTournamentId(tournament)) === formData.tournamentId,
    );
  }, [tournaments, formData.tournamentId]);

  useEffect(() => {
    let isMounted = true;

    const fetchTournaments = async () => {
      try {
        const res = await API.get("/tournaments");

        if (!isMounted) return;

        const data = res.data.tournaments || res.data || [];

        setTournaments(Array.isArray(data) ? data : []);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message || "Failed to fetch tournaments",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTournaments();

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
    if (!formData.tournamentId) {
      toast.error("Please select a tournament");
      return false;
    }

    if (!formData.matchNumber || Number(formData.matchNumber) <= 0) {
      toast.error("Please enter a valid match number");
      return false;
    }

    if (!formData.map.trim()) {
      toast.error("Please select a map");
      return false;
    }

    if (!formData.roomId.trim()) {
      toast.error("Please enter room ID");
      return false;
    }

    if (!formData.roomPassword.trim()) {
      toast.error("Please enter room password");
      return false;
    }

    if (!formData.matchTime) {
      toast.error("Please select match time");
      return false;
    }

    return true;
  };

  const createMatchRoom = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setCreating(true);

      const payload = {
        matchNumber: Number(formData.matchNumber),
        map: formData.map,
        roomId: formData.roomId.trim(),
        roomPassword: formData.roomPassword.trim(),
        matchTime: formData.matchTime,
      };

      const res = await API.post(
        `/matchrooms/create/${formData.tournamentId}`,
        payload,
      );

      toast.success(res.data.message || "Match room created successfully");

      setFormData({
        tournamentId: "",
        matchNumber: "",
        map: "Erangel",
        roomId: "",
        roomPassword: "",
        matchTime: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create match room",
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading tournaments"
          message="Fetching tournaments for match room creation."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load tournaments" message={error} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Admin Match Control</p>
        <h1 className={styles.title}>Create Match Room</h1>
        <p className={styles.subtitle}>
          Add private room details for a tournament so registered teams can join
          the match on time.
        </p>
      </section>

      <section className={styles.contentGrid}>
        <Card className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>Room Details</p>
              <h2>Match Room Setup</h2>
            </div>

            <span className={styles.badge}>Admin Only</span>
          </div>

          <form className={styles.form} onSubmit={createMatchRoom}>
            <div className={styles.fullField}>
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

            <div className={styles.twoColumn}>
              <div>
                <label className={styles.label} htmlFor="matchNumber">
                  Match Number
                </label>

                <input
                  id="matchNumber"
                  className={styles.input}
                  type="number"
                  min="1"
                  name="matchNumber"
                  value={formData.matchNumber}
                  onChange={handleChange}
                  placeholder="Example: 1"
                />
              </div>

              <div>
                <label className={styles.label} htmlFor="map">
                  Map
                </label>

                <select
                  id="map"
                  className={styles.input}
                  name="map"
                  value={formData.map}
                  onChange={handleChange}
                >
                  <option value="Erangel">Erangel</option>
                  <option value="Miramar">Miramar</option>
                  <option value="Sanhok">Sanhok</option>
                  <option value="Vikendi">Vikendi</option>
                  <option value="Livik">Livik</option>
                  <option value="Karakin">Karakin</option>
                </select>
              </div>
            </div>

            <div className={styles.twoColumn}>
              <div>
                <label className={styles.label} htmlFor="roomId">
                  Room ID
                </label>

                <input
                  id="roomId"
                  className={styles.input}
                  type="text"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  placeholder="Enter room ID"
                />
              </div>

              <div>
                <label className={styles.label} htmlFor="roomPassword">
                  Room Password
                </label>

                <input
                  id="roomPassword"
                  className={styles.input}
                  type="text"
                  name="roomPassword"
                  value={formData.roomPassword}
                  onChange={handleChange}
                  placeholder="Enter room password"
                />
              </div>
            </div>

            <div className={styles.fullField}>
              <label className={styles.label} htmlFor="matchTime">
                Match Time
              </label>

              <input
                id="matchTime"
                className={styles.input}
                type="datetime-local"
                name="matchTime"
                value={formData.matchTime}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" disabled={creating}>
              {creating ? "Creating Match Room..." : "Create Match Room"}
            </Button>
          </form>
        </Card>

        <aside className={styles.sidePanel}>
          <Card className={styles.previewCard}>
            <p className={styles.cardEyebrow}>Selected Tournament</p>

            {selectedTournament ? (
              <>
                <h2>{selectedTournament.title}</h2>
                <p className={styles.sideMeta}>
                  {selectedTournament.game || "BGMI"} •{" "}
                  {selectedTournament.mode || "Squad"}
                </p>

                <div className={styles.miniGrid}>
                  <div>
                    <span>Status</span>
                    <strong>{selectedTournament.status}</strong>
                  </div>

                  <div>
                    <span>Teams</span>
                    <strong>
                      {selectedTournament.registeredTeams?.length || 0}/
                      {selectedTournament.maxTeams || 0}
                    </strong>
                  </div>

                  <div>
                    <span>Entry Fee</span>
                    <strong>₹{selectedTournament.entryFee || 0}</strong>
                  </div>

                  <div>
                    <span>Prize Pool</span>
                    <strong>₹{selectedTournament.prizePool || 0}</strong>
                  </div>
                </div>
              </>
            ) : (
              <p className={styles.sideMeta}>
                Select a tournament to preview its quick details here.
              </p>
            )}
          </Card>

          <Card className={styles.rulesCard}>
            <p className={styles.cardEyebrow}>Room Checklist</p>
            <h2>Before creating room</h2>

            <div className={styles.checkList}>
              <div>
                <span>01</span>
                <p>Select the correct tournament.</p>
              </div>

              <div>
                <span>02</span>
                <p>Use accurate room ID and password.</p>
              </div>

              <div>
                <span>03</span>
                <p>Set match time clearly for all teams.</p>
              </div>

              <div>
                <span>04</span>
                <p>Share room details only with registered teams.</p>
              </div>
            </div>
          </Card>

          <Card className={styles.tipsCard}>
            <p className={styles.cardEyebrow}>Admin Note</p>
            <p className={styles.sideMeta}>
              After room creation, players can view match room details and
              submit their match results after the game.
            </p>
          </Card>
        </aside>
      </section>
    </main>
  );
};

export default CreateMatchRoom;
