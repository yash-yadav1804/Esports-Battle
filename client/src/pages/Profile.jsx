import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

import styles from "./Profile.module.css";

const getInitial = (name = "U") => {
  return name.charAt(0).toUpperCase();
};

const getProfileData = (response) => {
  return response.data?.user || response.data?.data?.user || response.data;
};

const getTeamData = (response) => {
  return response.data?.team || response.data?.data?.team || null;
};

const getTournamentsData = (response) => {
  return (
    response.data?.tournaments ||
    response.data?.data?.tournaments ||
    response.data?.data ||
    []
  );
};

const getMatchHistoryData = (response) => {
  return (
    response.data?.matchHistory ||
    response.data?.data?.matchHistory ||
    response.data?.data ||
    []
  );
};

const getUserId = (user) => {
  return user?._id || user?.id;
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = getUserId(profile);
  const iglId = team?.igl?._id || team?.igl;
  const isCaptain = team && String(iglId) === String(currentUserId);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      try {
        setError("");

        const profileResponse = await API.get("/profile/me");

        if (!isMounted) return;

        setProfile(getProfileData(profileResponse));

        try {
          const teamResponse = await API.get("/teams/my-team");

          if (isMounted) {
            setTeam(getTeamData(teamResponse));
          }
        } catch {
          if (isMounted) {
            setTeam(null);
          }
        }

        try {
          const tournamentsResponse = await API.get("/profile/my-tournaments");

          if (isMounted) {
            const tournamentData = getTournamentsData(tournamentsResponse);
            setTournaments(Array.isArray(tournamentData) ? tournamentData : []);
          }
        } catch {
          if (isMounted) {
            setTournaments([]);
          }
        }

        try {
          const historyResponse = await API.get("/profile/my-match-history");

          if (isMounted) {
            const historyData = getMatchHistoryData(historyResponse);
            setMatchHistory(Array.isArray(historyData) ? historyData : []);
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
        <section className={styles.stateCard}>
          <div className={styles.stateIcon}>⌛</div>
          <h1>Loading profile...</h1>
          <p>Fetching your profile, team, tournaments, and match history.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <section className={styles.stateCard}>
          <div className={styles.errorIcon}>!</div>
          <h1>Unable to load profile</h1>
          <p className={styles.error}>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Player Control Center</p>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>
            View your personal details, squad information, registered
            tournaments, and approved match performance from one clean
            dashboard.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link to="/my-team" className={styles.primaryAction}>
            My Team
          </Link>

          <Link to="/tournaments" className={styles.secondaryAction}>
            Explore Tournaments
          </Link>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>Role</span>
          <strong>{profile?.role || "Player"}</strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Team</span>
          <strong>{team?.teamName || "No Team"}</strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Registered Events</span>
          <strong>{tournaments.length}</strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Match Results</span>
          <strong>{matchHistory.length}</strong>
        </div>
      </section>

      <section className={styles.dashboardColumns}>
        <div className={styles.column}>
          <article className={styles.profileCard}>
            <div className={styles.profileTop}>
              <div className={styles.avatar}>{getInitial(profile?.name)}</div>

              <div className={styles.profileIdentity}>
                <p className={styles.cardEyebrow}>Personal Info</p>
                <h2>{profile?.name || "User"}</h2>
                <p>{profile?.email || "Email not added"}</p>
              </div>

              <span className={styles.roleBadge}>
                {profile?.role || "player"}
              </span>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoBox}>
                <span>IGN</span>
                <strong>{profile?.ign || "Not added"}</strong>
              </div>

              <div className={styles.infoBox}>
                <span>BGMI UID</span>
                <strong>{profile?.bgmiUID || "Not added"}</strong>
              </div>

              <div className={styles.infoBox}>
                <span>Account Role</span>
                <strong>{profile?.role || "Player"}</strong>
              </div>

              <div className={styles.infoBox}>
                <span>Email</span>
                <strong className={styles.noCapitalize}>
                  {profile?.email || "Not added"}
                </strong>
              </div>
            </div>
          </article>

          <article className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>Registered Events</p>
                <h2>My Tournaments</h2>
                <p>Tournaments where your team is currently registered.</p>
              </div>

              <Link to="/tournaments" className={styles.cardLink}>
                View All
              </Link>
            </div>

            {tournaments.length === 0 ? (
              <div className={styles.emptyBox}>
                No tournaments found. Register your team in a tournament to see
                it here.
              </div>
            ) : (
              <div className={styles.list}>
                {tournaments.map((tournament) => (
                  <div className={styles.tournamentItem} key={tournament._id}>
                    <div>
                      <strong>{tournament.title}</strong>
                      <p>
                        {tournament.game || "BGMI"} •{" "}
                        {tournament.mode || "Squad"}
                      </p>
                    </div>

                    <span className={styles.statusBadge}>
                      {tournament.status || "upcoming"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>

        <div className={styles.column}>
          <article className={styles.teamCard}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>My Team</p>
                <h2>{team ? team.teamName : "No Team Yet"}</h2>
                <p>
                  {team
                    ? "Your current esports squad and registered players."
                    : "Create or join a team to participate in tournaments."}
                </p>
              </div>

              <Link to="/my-team" className={styles.cardLink}>
                Full Team
              </Link>
            </div>

            {team ? (
              <>
                <div className={styles.infoGrid}>
                  <div className={styles.infoBox}>
                    <span>Team Name</span>
                    <strong>{team.teamName}</strong>
                  </div>

                  <div className={styles.infoBox}>
                    <span>Max Players</span>
                    <strong>{team.maxPlayers || 4}</strong>
                  </div>

                  <div className={styles.infoBox}>
                    <span>Total Players</span>
                    <strong>{team.players?.length || 0}</strong>
                  </div>

                  <div className={styles.infoBox}>
                    <span>Your Team Role</span>
                    <strong>{isCaptain ? "Captain / IGL" : "Player"}</strong>
                  </div>
                </div>

                {isCaptain && (
                  <Link to="/team-requests" className={styles.requestBanner}>
                    Review pending team join requests →
                  </Link>
                )}

                <div className={styles.playerList}>
                  <h3>Players</h3>

                  <div className={styles.list}>
                    {team.players?.map((player) => {
                      const playerId = getUserId(player);
                      const isPlayerCaptain =
                        String(playerId) === String(iglId);

                      return (
                        <div className={styles.listItem} key={playerId}>
                          <div className={styles.smallAvatar}>
                            {getInitial(player.name)}
                          </div>

                          <div className={styles.playerInfo}>
                            <strong>{player.name}</strong>
                            <p>{player.ign || "IGN not added"}</p>
                          </div>

                          {isPlayerCaptain && (
                            <span className={styles.captainBadge}>Captain</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyActionBox}>
                <p>You are not in any team yet.</p>

                <div className={styles.emptyActions}>
                  <Link to="/teams/create" className={styles.primaryAction}>
                    Create Team
                  </Link>

                  <Link to="/teams" className={styles.secondaryAction}>
                    View Teams
                  </Link>
                </div>
              </div>
            )}
          </article>

          <article className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>Performance</p>
                <h2>Match History</h2>
                <p>Your approved match results and earned points.</p>
              </div>
            </div>

            {matchHistory.length === 0 ? (
              <div className={styles.emptyBox}>No match history found.</div>
            ) : (
              <div className={styles.list}>
                {matchHistory.map((match) => (
                  <div className={styles.historyItem} key={match._id}>
                    <div>
                      <strong>{match.tournament?.title || "Tournament"}</strong>
                      <p>
                        Kills: {match.kills ?? 0} • Position: #
                        {match.position ?? "N/A"}
                      </p>
                    </div>

                    <span className={styles.pointsBadge}>
                      {match.totalPoints ?? 0} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
};

export default Profile;
