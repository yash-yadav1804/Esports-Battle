import { useEffect, useState } from "react";
import API from "../api/axios";
import styles from "./Profile.module.css";
const getInitial = (name = "U") => {
  return name.charAt(0).toUpperCase();
};
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let isMounted = true;
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError("");
        const profileRes = await API.get("/profile/me");
        if (!isMounted) return;
        setProfile(profileRes.data.user);
        try {
          const teamRes = await API.get("/profile/my-team");
          if (isMounted) {
            setTeam(teamRes.data.team);
          }
        } catch {
          if (isMounted) {
            setTeam(null);
          }
        }
        try {
          const tournamentsRes = await API.get("/profile/my-tournaments");
          if (isMounted) {
            setTournaments(tournamentsRes.data.tournaments || []);
          }
        } catch {
          if (isMounted) {
            setTournaments([]);
          }
        }
        try {
          const historyRes = await API.get("/profile/my-match-history");
          if (isMounted) {
            setMatchHistory(historyRes.data.matchHistory || []);
          }
        } catch {
          if (isMounted) {
            setMatchHistory([]);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        setError(error.response?.data?.message || "Failed to fetch profile");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchProfileData();
    return () => {
      isMounted = false;
    };
  }, []);
  if (loading) {
    return (
      <main className={styles.page}>
        {" "}
        <div className={styles.stateCard}>
          {" "}
          <h1>Loading profile...</h1>{" "}
          <p>
            Fetching your profile, team, tournaments, and match history.
          </p>{" "}
        </div>{" "}
      </main>
    );
  }
  if (error) {
    return (
      <main className={styles.page}>
        {" "}
        <div className={styles.stateCard}>
          {" "}
          <h1>Error</h1> <p className={styles.error}>{error}</p>{" "}
        </div>{" "}
      </main>
    );
  }
  return (
    <main className={styles.page}>
      {" "}
      <section className={styles.header}>
        {" "}
        <p className={styles.eyebrow}>Player Control Center</p>{" "}
        <h1 className={styles.title}>My Profile</h1>{" "}
        <p className={styles.subtitle}>
          {" "}
          View your personal details, team information, registered tournaments,
          and match performance history in one place.{" "}
        </p>{" "}
      </section>{" "}
      <section className={styles.dashboardColumns}>
        {" "}
        <div className={styles.column}>
          {" "}
          <div className={styles.profileCard}>
            {" "}
            <div className={styles.profileTop}>
              {" "}
              <div className={styles.avatar}>
                {getInitial(profile?.name)}
              </div>{" "}
              <div>
                {" "}
                <p className={styles.cardEyebrow}>Personal Info</p>{" "}
                <h2>{profile?.name || "User"}</h2> <p>{profile?.email}</p>{" "}
              </div>{" "}
              <span className={styles.roleBadge}>{profile?.role}</span>{" "}
            </div>{" "}
            <div className={styles.infoGrid}>
              {" "}
              <div className={styles.infoBox}>
                {" "}
                <span>IGN</span>{" "}
                <strong>{profile?.ign || "Not added"}</strong>{" "}
              </div>{" "}
              <div className={styles.infoBox}>
                {" "}
                <span>BGMI UID</span>{" "}
                <strong>{profile?.bgmiUID || "Not added"}</strong>{" "}
              </div>{" "}
              <div className={styles.infoBox}>
                {" "}
                <span>Role</span>{" "}
                <strong>{profile?.role || "User"}</strong>{" "}
              </div>{" "}
              <div className={styles.infoBox}>
                {" "}
                <span>Email</span>{" "}
                <strong>{profile?.email || "Not added"}</strong>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className={styles.sectionCard}>
            {" "}
            <div className={styles.cardHeader}>
              {" "}
              <div>
                {" "}
                <p className={styles.cardEyebrow}>Registered Events</p>{" "}
                <h2>My Tournaments</h2>{" "}
                <p>Tournaments where your team is currently registered.</p>{" "}
              </div>{" "}
            </div>{" "}
            {tournaments.length === 0 ? (
              <div className={styles.emptyBox}>No tournaments found.</div>
            ) : (
              <div className={styles.list}>
                {" "}
                {tournaments.map((tournament) => (
                  <div className={styles.tournamentItem} key={tournament._id}>
                    {" "}
                    <div>
                      {" "}
                      <strong>{tournament.title}</strong>{" "}
                      <p>
                        {" "}
                        {tournament.game || "BGMI"} •{" "}
                        {tournament.mode || "Squad"}{" "}
                      </p>{" "}
                    </div>{" "}
                    <span className={styles.statusBadge}>
                      {" "}
                      {tournament.status}{" "}
                    </span>{" "}
                  </div>
                ))}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        <div className={styles.column}>
          {" "}
          <div className={styles.teamCard}>
            {" "}
            <div className={styles.cardHeader}>
              {" "}
              <div>
                {" "}
                <p className={styles.cardEyebrow}>My Team</p>{" "}
                <h2>{team ? team.teamName : "No Team Yet"}</h2>{" "}
                <p>
                  {" "}
                  {team
                    ? "Your current esports squad and registered players."
                    : "Create or join a team to participate in tournaments."}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            {team ? (
              <>
                {" "}
                <div className={styles.infoGrid}>
                  {" "}
                  <div className={styles.infoBox}>
                    {" "}
                    <span>Team Name</span> <strong>{team.teamName}</strong>{" "}
                  </div>{" "}
                  <div className={styles.infoBox}>
                    {" "}
                    <span>Max Players</span>{" "}
                    <strong>{team.maxPlayers}</strong>{" "}
                  </div>{" "}
                  <div className={styles.infoBox}>
                    {" "}
                    <span>Total Players</span>{" "}
                    <strong>{team.players?.length || 0}</strong>{" "}
                  </div>{" "}
                  <div className={styles.infoBox}>
                    {" "}
                    <span>Status</span> <strong>Active</strong>{" "}
                  </div>{" "}
                </div>{" "}
                <div className={styles.playerList}>
                  {" "}
                  <h3>Players</h3>{" "}
                  <div className={styles.list}>
                    {" "}
                    {team.players?.map((player) => (
                      <div className={styles.listItem} key={player._id}>
                        {" "}
                        <div className={styles.smallAvatar}>
                          {" "}
                          {getInitial(player.name)}{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <strong>{player.name}</strong>{" "}
                          <p>{player.ign || "IGN not added"}</p>{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                </div>{" "}
              </>
            ) : (
              <div className={styles.emptyBox}>
                {" "}
                You are not in any team yet.{" "}
              </div>
            )}{" "}
          </div>{" "}
          <div className={styles.sectionCard}>
            {" "}
            <div className={styles.cardHeader}>
              {" "}
              <div>
                {" "}
                <p className={styles.cardEyebrow}>Performance</p>{" "}
                <h2>Match History</h2>{" "}
                <p>Your approved match results and earned points.</p>{" "}
              </div>{" "}
            </div>{" "}
            {matchHistory.length === 0 ? (
              <div className={styles.emptyBox}>No match history found.</div>
            ) : (
              <div className={styles.list}>
                {" "}
                {matchHistory.map((match) => (
                  <div className={styles.historyItem} key={match._id}>
                    {" "}
                    <div>
                      {" "}
                      <strong>
                        {match.tournament?.title || "Tournament"}
                      </strong>{" "}
                      <p>
                        {" "}
                        Kills: {match.kills} • Points: {match.totalPoints}{" "}
                      </p>{" "}
                    </div>{" "}
                    <span className={styles.pointsBadge}>
                      {" "}
                      {match.totalPoints} pts{" "}
                    </span>{" "}
                  </div>
                ))}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </main>
  );
};
export default Profile;
