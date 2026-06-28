import { useEffect, useState } from "react";
import API from "../api/axios";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../components/ui/useToast";

import styles from "./ManageUsers.module.css";

const getUserId = (user) => {
  return user?._id || user?.id;
};

const getRoleVariant = (role) => {
  if (role === "admin") return "warning";
  return "success";
};

const ManageUsers = () => {
  const toast = useToast();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");

      setUsers(res.data.users || []);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const res = await API.get("/admin/users");

        if (!isMounted) return;

        setUsers(res.data.users || []);
        setError("");
      } catch (error) {
        if (!isMounted) return;

        setError(error.response?.data?.message || "Failed to fetch users");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const deleteUser = async (userId) => {
    const currentUserId = getUserId(currentUser);

    if (String(userId) === String(currentUserId)) {
      toast.error("You cannot delete your own logged-in account");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(userId);

      const res = await API.delete(`/admin/users/${userId}`);

      toast.success(res.data.message || "User deleted successfully");

      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <LoadingState
          title="Loading users"
          message="Fetching all registered platform users."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <ErrorState title="Unable to load users" message={error} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Admin User Control</p>
        <h1 className={styles.title}>Manage Users</h1>
        <p className={styles.subtitle}>
          View registered players and admins. Remove inactive or invalid users
          when required.
        </p>
      </section>

      {users.length === 0 ? (
        <EmptyState
          title="No users found"
          message="Registered users will appear here."
        />
      ) : (
        <section className={styles.grid}>
          {users.map((user) => {
            const isCurrentUser =
              String(getUserId(user)) === String(getUserId(currentUser));

            return (
              <Card className={styles.userCard} key={user._id}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                  </div>

                  <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoBox}>
                    <span>IGN</span>
                    <strong>{user.ign || "Not added"}</strong>
                  </div>

                  <div className={styles.infoBox}>
                    <span>BGMI UID</span>
                    <strong>{user.bgmiUID || "Not added"}</strong>
                  </div>

                  <div className={styles.infoBox}>
                    <span>Account</span>
                    <strong>{isCurrentUser ? "Current User" : "User"}</strong>
                  </div>

                  <div className={styles.infoBox}>
                    <span>Joined</span>
                    <strong>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </strong>
                  </div>
                </div>

                <Button
                  variant="danger"
                  onClick={() => deleteUser(user._id)}
                  disabled={isCurrentUser || actionLoading === user._id}
                >
                  {actionLoading === user._id
                    ? "Deleting..."
                    : isCurrentUser
                      ? "Current Account"
                      : "Delete User"}
                </Button>
              </Card>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default ManageUsers;
