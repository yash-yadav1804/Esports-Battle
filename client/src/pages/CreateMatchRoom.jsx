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

const getResponseData = (response) => {
  return response.data?.data || response.data;
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const CreateMatchRoom = () => {
  const toast = useToast();
  const user = getStoredUser();

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

    const fetchCreatedTournaments = async () => {
      try {
        const response = await API.get("/tournaments/my-created");

        if (!isMounted) return;

        const data = getResponseData(response);

        const availableTournaments = Array.isArray(data)
          ? data.filter((tournament) => tournament.status !== "completed")
          : [];

        setTournaments(availableTournaments);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(
          error.response?.data?.message ||
            "Failed to fetch your created tournaments",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCreatedTournaments();

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

    if (!formData.roomId || Number(formData.roomId) <= 0) {
      toast.error("Please enter a valid room ID");
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
        roomId: Number(formData.roomId),
        roomPassword: formData.roomPassword.trim(),
        matchTime: formData.matchTime,
      };

      const response = await API.post(
        `/matchrooms/create/${formData.tournamentId}`,
        payload,
      );

      toast.success(response.data.message || "Match room created successfully");

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
          message="Fetching tournaments you are allowed to manage."
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
        <p className={styles.eyebrow}>Match Room Control</p>
        <h1 className={styles.title}>Create Match Room</h1>
        <p className={styles.subtitle}>
          Create private room details for tournaments you are allowed to manage.
          Organizers can create rooms only for their own tournaments.
        </p>
      </section>

      <section className={styles.contentGrid}>
        <Card className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>Room Details</p>
              <h2>Match Room Setup</h2>
            </div>

            <span className={styles.badge}>{user?.role || "user"}</span>
          </div>

          {tournaments.length === 0 ? (
            <div className={styles.emptyBox}>
              No manageable tournaments found. Create a tournament first, then
              create match rooms for it.
            </div>
          ) : (
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
                    type="number"
                    min="1"
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
          )}
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
            <p className={styles.cardEyebrow}>Permission Rule</p>
            <h2>Ownership Based Access</h2>

            <div className={styles.checkList}>
              <div>
                <span>01</span>
                <p>Organizer can create rooms only for own tournaments.</p>
              </div>

              <div>
                <span>02</span>
                <p>Admin and SuperAdmin can manage all tournaments.</p>
              </div>

              <div>
                <span>03</span>
                <p>Players cannot create match rooms.</p>
              </div>

              <div>
                <span>04</span>
                <p>Completed tournaments are hidden from room creation.</p>
              </div>
            </div>
          </Card>

          <Card className={styles.tipsCard}>
            <p className={styles.cardEyebrow}>Admin Note</p>
            <p className={styles.sideMeta}>
              Match room data includes room ID, password, map, match number, and
              match time. Players can use this information before submitting
              results.
            </p>
          </Card>
        </aside>
      </section>
    </main>
  );
};

export default CreateMatchRoom;
