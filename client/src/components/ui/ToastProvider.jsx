import { useCallback, useMemo, useState } from "react";
import { ToastContext } from "./toastContext";
import styles from "./ToastProvider.module.css";

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message }) => {
      const id = crypto.randomUUID();

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id,
          type,
          title,
          message,
        },
      ]);

      window.setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({
      success: (message, title = "Success") =>
        showToast({ type: "success", title, message }),

      error: (message, title = "Error") =>
        showToast({ type: "error", title, message }),

      info: (message, title = "Info") =>
        showToast({ type: "info", title, message }),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div
            className={`${styles.toast} ${styles[toast.type]}`}
            key={toast.id}
          >
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>

            <button
              className={styles.closeBtn}
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
