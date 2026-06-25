import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/tournaments");
        setTournaments(res.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch tournaments",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h1>Loading tournaments...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1>Error</h1>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Tournaments</h1>

      {tournaments.length === 0 ? (
        <p>No tournaments found</p>
      ) : (
        <div className="grid">
          {tournaments.map((tournament) => (
            <div className="card" key={tournament._id}>
              <h2>{tournament.title}</h2>
              <p>Game: {tournament.game}</p>
              <p>Mode: {tournament.mode}</p>
              <p>Entry Fee: ₹{tournament.entryFee}</p>
              <p>Prize Pool: ₹{tournament.prizePool}</p>
              <p>Status: {tournament.status}</p>

              <Link
                className="linkButton"
                to={`/tournaments/${tournament._id}`}
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tournaments;
