import styles from "./StateMessage.module.css";

const LoadingState = ({
  title = "Loading data...",
  message = "Please wait while we fetch the latest information.",
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner}></div>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
};

export default LoadingState;
