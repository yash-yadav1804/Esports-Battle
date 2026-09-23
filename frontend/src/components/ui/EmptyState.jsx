import { Link } from "react-router-dom";
import styles from "./StateMessage.module.css";

const EmptyState = ({
  title = "No data found",
  message = "There is nothing to show here yet.",
  actionLabel,
  actionTo,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.emptyIcon}>○</div>

      <h2>{title}</h2>
      <p>{message}</p>

      {actionLabel && actionTo && (
        <Link className={styles.actionButton} to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
