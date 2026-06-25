import { useEffect, useState } from "react";
import API from "../api/axios";
import styles from "./Notifications.module.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshNotifications = async () => {
    try {
      const res = await API.get("/notifications/my");

      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch notifications",
      );
    }
  };

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const res = await API.get("/notifications/my");

        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch notifications",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInitialNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await API.patch(`/notifications/read/${notificationId}`);
      await refreshNotifications();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      await refreshNotifications();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to mark all as read");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <h1>Loading notifications...</h1>
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
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>Unread: {unreadCount}</p>
        </div>

        {notifications.length > 0 && (
          <button className={styles.readAllBtn} onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={styles.emptyBox}>
          <p>No notifications found</p>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`${styles.card} ${
                !notification.isRead ? styles.unread : ""
              }`}
            >
              <div className={styles.cardHeader}>
                <h2>{notification.title}</h2>
                <span className={styles.type}>{notification.type}</span>
              </div>

              <p className={styles.message}>{notification.message}</p>

              <p className={styles.date}>
                {new Date(notification.createdAt).toLocaleString()}
              </p>

              {!notification.isRead ? (
                <button
                  className={styles.readBtn}
                  onClick={() => markAsRead(notification._id)}
                >
                  Mark as read
                </button>
              ) : (
                <span className={styles.readText}>Read</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
