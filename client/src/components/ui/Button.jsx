import styles from "./Button.module.css";

const Button = ({
  children,
  variant = "primary",
  type = "button",
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
