import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";

const TournamentDetails = () => {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(`/tournaments/${tournamentId}`);
        setTournament(res.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch tournament");
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="page">
        <h1>Loading tournament details...</h1>
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
      <Link className="backLink" to="/tournaments">
        ← Back to Tournaments
      </Link>

      <div className="card largeCard">
        <h1>{tournament.title}</h1>

        <p>Game: {tournament.game}</p>
        <p>Mode: {tournament.mode}</p>
        <p>Entry Fee: ₹{tournament.entryFee}</p>
        <p>Prize Pool: ₹{tournament.prizePool}</p>
        <p>Max Teams: {tournament.maxTeams}</p>
        <p>Status: {tournament.status}</p>
        <p>Start Date: {new Date(tournament.startDate).toLocaleDateString()}</p>

        <h2>Registered Teams</h2>

        {tournament.registeredTeams?.length === 0 ? (
          <p>No teams registered yet</p>
        ) : (
          <ul>
            {tournament.registeredTeams.map((team) => (
              <li key={team._id}>{team.teamName}</li>
            ))}
          </ul>
        )}

        <Link className="linkButton" to={`/leaderboard/${tournament._id}`}>
          View Leaderboard
        </Link>
      </div>
    </div>
  );
};

export default TournamentDetails;
