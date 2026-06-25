import { useEffect, useState } from "react";
import API from "../api/axios";
import styles from "./Profile.module.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError("");

        const profileRes = await API.get("/profile/me");
        setProfile(profileRes.data.user);

        try {
          const teamRes = await API.get("/profile/my-team");
          setTeam(teamRes.data.team);
        } catch {
          setTeam(null);
        }

        try {
          const tournamentsRes = await API.get("/profile/my-tournaments");
          setTournaments(tournamentsRes.data.tournaments || []);
        } catch {
          setTournaments([]);
        }

        try {
          const historyRes = await API.get("/profile/my-match-history");
          setMatchHistory(historyRes.data.matchHistory || []);
        } catch {
          setMatchHistory([]);
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <h1>Loading profile...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1>Error</h1>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Profile</h1>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Personal Info</h2>

          <p>Name: {profile?.name}</p>
          <p>Email: {profile?.email}</p>
          <p>IGN: {profile?.ign || "Not added"}</p>
          <p>BGMI UID: {profile?.bgmiUID || "Not added"}</p>
          <p>Role: {profile?.role}</p>
        </div>

        <div className={styles.card}>
          <h2>My Team</h2>

          {team ? (
            <>
              <p>Team Name: {team.teamName}</p>
              <p>Max Players: {team.maxPlayers}</p>
              <p>Total Players: {team.players?.length}</p>

              <h3>Players</h3>
              <ul>
                {team.players?.map((player) => (
                  <li key={player._id}>
                    {player.name} - {player.ign}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>You are not in any team</p>
          )}
        </div>

        <div className={styles.card}>
          <h2>My Tournaments</h2>

          {tournaments.length === 0 ? (
            <p>No tournaments found</p>
          ) : (
            <ul>
              {tournaments.map((tournament) => (
                <li key={tournament._id}>
                  {tournament.title} - {tournament.status}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.card}>
          <h2>Match History</h2>

          {matchHistory.length === 0 ? (
            <p>No match history found</p>
          ) : (
            <ul>
              {matchHistory.map((match) => (
                <li key={match._id}>
                  {match.tournament?.title} | Kills: {match.kills} | Points:{" "}
                  {match.totalPoints}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
