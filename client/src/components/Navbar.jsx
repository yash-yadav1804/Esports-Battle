import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./ui/useToast";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.info("You have been logged out");
    navigate("/login");
  };

  const closeProfileDropdown = () => {
    setIsProfileOpen(false);
  };

  const getNavClass = ({ isActive }) => {
    return isActive ? `${styles.link} ${styles.activeLink}` : styles.link;
  };

  if (location.pathname === "/login") {
    return null;
  }

  return (
    <header className={styles.navbar}>
      <Link to="/tournaments" className={styles.logo}>
        <span className={styles.logoMark}>E</span>
        Esports Battle
      </Link>

      <nav className={styles.links}>
        <NavLink to="/tournaments" className={getNavClass}>
          Tournaments
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

        {user?.role === "admin" && (
          <>
            <NavLink to="/admin/dashboard" className={getNavClass}>
              Admin Dashboard
            </NavLink>

            <NavLink to="/admin/create-tournament" className={getNavClass}>
              Create Tournament
            </NavLink>

            <NavLink to="/admin/create-match-room" className={getNavClass}>
              Create Match Room
            </NavLink>
          </>
        )}
      </nav>

      {token && user && (
        <div className={styles.profileArea}>
          <button
            className={styles.profileButton}
            onClick={() => setIsProfileOpen((currentValue) => !currentValue)}
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
                onClick={closeProfileDropdown}
              >
                My Profile
              </NavLink>

              <NavLink
                to="/notifications"
                className={styles.dropdownLink}
                onClick={closeProfileDropdown}
              >
                Notifications
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
