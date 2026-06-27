import { useEffect, useState } from "react";
import API from "../api/axios";
import TournamentCard from "../components/ui/TournamentCard";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import styles from "./Tournaments.module.css";

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTournaments = async () => {
      try {
        const res = await API.get("/tournaments");

        if (!isMounted) return;

        setTournaments(res.data);
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
  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading tournaments"
          message="Fetching the latest BGMI tournaments for you."
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
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Esports Battle</p>
          <h1 className={styles.title}>BGMI Tournaments</h1>
          <p className={styles.subtitle}>
            Join competitive BGMI tournaments, register your team, and track
            rankings in real time.
          </p>
        </div>
      </section>

      {tournaments.length === 0 ? (
        <EmptyState
          title="No tournaments available"
          message="New tournaments will appear here once the admin creates them."
          actionLabel="Create Tournament"
          actionTo="/admin/create-tournament"
        />
      ) : (
        <section className={styles.grid}>
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament._id} tournament={tournament} />
          ))}
        </section>
      )}
    </main>
  );
};

export default Tournaments;
