import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./ui/useToast";
import styles from "./Navbar.module.css";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = getStoredUser();

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.info("You have been logged out");
    navigate("/login");
  };

  const closeDropdowns = () => {
    setIsProfileOpen(false);
    setIsAdminOpen(false);
  };

  const getNavClass = ({ isActive }) => {
    return isActive ? `${styles.link} ${styles.activeLink}` : styles.link;
  };

  const adminPathActive = location.pathname.startsWith("/admin");

  if (location.pathname === "/login") {
    return null;
  }

  return (
    <header className={styles.navbar}>
      <Link to="/tournaments" className={styles.logo} onClick={closeDropdowns}>
        <span className={styles.logoMark}>E</span>
        Esports Battle
      </Link>

      <nav className={styles.links}>
        <NavLink to="/tournaments" className={getNavClass}>
          Tournaments
        </NavLink>

        <NavLink to="/history" className={getNavClass}>
          History
        </NavLink>

        <NavLink to="/match-rooms" className={getNavClass}>
          Match Rooms
        </NavLink>

        <NavLink to="/submit-result" className={getNavClass}>
          Submit Result
        </NavLink>

        <NavLink to="/teams" className={getNavClass}>
          Teams
        </NavLink>

        <NavLink to="/teams/create" className={getNavClass}>
          Create Team
        </NavLink>

        <NavLink to="/team-requests" className={getNavClass}>
          Team Requests
        </NavLink>

        {isAdmin && (
          <div className={styles.adminMenu}>
            <button
              className={`${styles.link} ${
                adminPathActive ? styles.activeLink : ""
              }`}
              onClick={() => {
                setIsAdminOpen((currentValue) => !currentValue);
                setIsProfileOpen(false);
              }}
            >
              Admin ▾
            </button>

            {isAdminOpen && (
              <div className={styles.adminDropdown}>
                <NavLink
                  to="/admin/dashboard"
                  className={styles.dropdownLink}
                  onClick={closeDropdowns}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/admin/manage-users"
                  className={styles.dropdownLink}
                  onClick={closeDropdowns}
                >
                  Manage Users
                </NavLink>

                <NavLink
                  to="/admin/manage-teams"
                  className={styles.dropdownLink}
                  onClick={closeDropdowns}
                >
                  Manage Teams
                </NavLink>

                <NavLink
                  to="/admin/create-tournament"
                  className={styles.dropdownLink}
                  onClick={closeDropdowns}
                >
                  Create Tournament
                </NavLink>

                <NavLink
                  to="/admin/manage-tournaments"
                  className={styles.dropdownLink}
                  onClick={closeDropdowns}
                >
                  Manage Tournaments
                </NavLink>

                <NavLink
                  to="/admin/create-match-room"
                  className={styles.dropdownLink}
                  onClick={closeDropdowns}
                >
                  Create Match Room
                </NavLink>

                <NavLink
                  to="/admin/pending-results"
                  className={styles.dropdownLink}
                  onClick={closeDropdowns}
                >
                  Pending Results
                </NavLink>
              </div>
            )}
          </div>
        )}
      </nav>

      {token && user && (
        <div className={styles.profileArea}>
          <button
            className={styles.profileButton}
            onClick={() => {
              setIsProfileOpen((currentValue) => !currentValue);
              setIsAdminOpen(false);
            }}
          >
            <div className={styles.avatar}>
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className={styles.userInfo}>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
          </button>

          {isProfileOpen && (
            <div className={styles.dropdown}>
              <NavLink
                to="/profile"
                className={styles.dropdownLink}
                onClick={closeDropdowns}
              >
                My Profile
              </NavLink>

              <NavLink
                to="/notifications"
                className={styles.dropdownLink}
                onClick={closeDropdowns}
              >
                Notifications
              </NavLink>

              <NavLink
                to="/my-submissions"
                className={styles.dropdownLink}
                onClick={closeDropdowns}
              >
                My Submissions
              </NavLink>

              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
