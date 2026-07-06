import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

const NotFound = () => {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.code}>404</p>
        <h1>Page not found</h1>
        <p>
          The page you are trying to open does not exist or may have been moved.
        </p>

        <div className={styles.actions}>
          <Link to="/tournaments" className={styles.primaryButton}>
            Go to Tournaments
          </Link>

          <Link to="/" className={styles.secondaryButton}>
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
