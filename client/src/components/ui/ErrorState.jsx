import styles from "./StateMessage.module.css";

const ErrorState = ({
  title = "Something went wrong",
  message = "We could not complete this request.",
  onRetry,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.errorIcon}>!</div>

      <h2>{title}</h2>
      <p>{message}</p>

      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
