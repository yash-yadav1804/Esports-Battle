import { Link } from "react-router-dom";
import Badge from "./Badge";
import Card from "./Card";
import styles from "./TournamentCard.module.css";

const getStatusVariant = (status) => {
  if (status === "live") return "warning";
  if (status === "completed") return "danger";

  return "success";
};

const TournamentCard = ({ tournament }) => {
  const registeredCount = tournament.registeredTeams?.length || 0;

  return (
    <Card className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src="/images/bgmi-card.jpg"
          alt={tournament.title}
          className={styles.image}
        />

        <div className={styles.overlay}>
          <Badge variant={getStatusVariant(tournament.status)}>
            {tournament.status}
          </Badge>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>{tournament.title}</h2>

          <p className={styles.meta}>
            {tournament.game} • {tournament.mode}
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span>Prize Pool</span>
            <strong>₹{tournament.prizePool}</strong>
          </div>

          <div className={styles.statBox}>
            <span>Entry</span>
            <strong>₹{tournament.entryFee}</strong>
          </div>

          <div className={styles.statBox}>
            <span>Teams</span>
            <strong>
              {registeredCount}/{tournament.maxTeams}
            </strong>
          </div>
        </div>

        <Link
          className={styles.detailsButton}
          to={`/tournaments/${tournament._id}`}
        >
          View Details
        </Link>
      </div>
    </Card>
  );
};

export default TournamentCard;
