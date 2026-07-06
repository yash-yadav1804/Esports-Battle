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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = getStoredUser();

  const role = user?.role;

  const isPlayer = role === "player";
  const isOrganizer = role === "organizer";
  const isAdmin = role === "admin" || role === "superAdmin";

  const canManageTournaments = isOrganizer || isAdmin;

  const adminPathActive = location.pathname.startsWith("/admin");

  const managementPathActive =
    location.pathname.startsWith("/tournaments/create") ||
    location.pathname.startsWith("/tournaments/manage") ||
    location.pathname.startsWith("/match-rooms/create");

  const closeDropdowns = () => {
    setIsProfileOpen(false);
    setIsAdminOpen(false);
    setIsManagementOpen(false);
  };

  const closeEverything = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsAdminOpen(false);
    setIsManagementOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.info("You have been logged out");

    closeEverything();
    navigate("/login");
  };

  const getNavClass = ({ isActive }) => {
    return isActive ? `${styles.link} ${styles.activeLink}` : styles.link;
  };

  if (location.pathname === "/login") {
    return null;
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.navTop}>
        <Link
          to="/tournaments"
          className={styles.logo}
          onClick={closeEverything}
        >
          <span className={styles.logoMark}>E</span>
          Esports Battle
        </Link>

        <button
          className={styles.menuToggle}
          type="button"
          onClick={() => {
            setIsMenuOpen((currentValue) => !currentValue);
            closeDropdowns();
          }}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? "×" : "☰"}
        </button>
      </div>

      <div
        className={`${styles.navContent} ${
          isMenuOpen ? styles.navContentOpen : ""
        }`}
      >
        <nav className={styles.links}>
          <NavLink
            to="/tournaments"
            className={getNavClass}
            onClick={closeEverything}
          >
            Tournaments
          </NavLink>

          <NavLink
            to="/history"
            className={getNavClass}
            onClick={closeEverything}
          >
            History
          </NavLink>

          <NavLink
            to="/match-rooms"
            className={getNavClass}
            onClick={closeEverything}
          >
            Match Rooms
          </NavLink>

          <NavLink
            to="/submit-result"
            className={getNavClass}
            onClick={closeEverything}
          >
            Submit Result
          </NavLink>

          <NavLink
            to="/teams"
            className={getNavClass}
            onClick={closeEverything}
          >
            Teams
          </NavLink>

          {canManageTournaments && (
            <div className={styles.managementMenu}>
              <button
                className={`${styles.link} ${styles.menuButton} ${
                  managementPathActive ? styles.activeLink : ""
                }`}
                type="button"
                onClick={() => {
                  setIsManagementOpen((currentValue) => !currentValue);
                  setIsAdminOpen(false);
                  setIsProfileOpen(false);
                }}
              >
                Management ▾
              </button>

              {isManagementOpen && (
                <div className={styles.managementDropdown}>
                  <NavLink
                    to="/tournaments/create"
                    className={styles.dropdownLink}
                    onClick={closeEverything}
                  >
                    Create Tournament
                  </NavLink>

                  <NavLink
                    to="/tournaments/manage"
                    className={styles.dropdownLink}
                    onClick={closeEverything}
                  >
                    Manage Tournaments
                  </NavLink>

                  <NavLink
                    to="/match-rooms/create"
                    className={styles.dropdownLink}
                    onClick={closeEverything}
                  >
                    Create Match Room
                  </NavLink>
                  <NavLink
                    to="/results/pending"
                    className={styles.dropdownLink}
                    onClick={closeEverything}
                  >
                    Pending Results
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {isPlayer && (
            <NavLink
              to="/organizer/apply"
              className={getNavClass}
              onClick={closeEverything}
            >
              Become Organizer
            </NavLink>
          )}

          {isAdmin && (
            <div className={styles.adminMenu}>
              <button
                className={`${styles.link} ${styles.menuButton} ${
                  adminPathActive ? styles.activeLink : ""
                }`}
                type="button"
                onClick={() => {
                  setIsAdminOpen((currentValue) => !currentValue);
                  setIsManagementOpen(false);
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
                    onClick={closeEverything}
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/admin/organizer-requests"
                    className={styles.dropdownLink}
                    onClick={closeEverything}
                  >
                    Organizer Requests
                  </NavLink>

                  <NavLink
                    to="/admin/manage-users"
                    className={styles.dropdownLink}
                    onClick={closeEverything}
                  >
                    Manage Users
                  </NavLink>

                  <NavLink
                    to="/admin/manage-teams"
                    className={styles.dropdownLink}
                    onClick={closeEverything}
                  >
                    Manage Teams
                  </NavLink>

                  <NavLink
                    to="/results/pending"
                    className={styles.dropdownLink}
                    onClick={closeEverything}
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
              type="button"
              onClick={() => {
                setIsProfileOpen((currentValue) => !currentValue);
                setIsAdminOpen(false);
                setIsManagementOpen(false);
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
                  onClick={closeEverything}
                >
                  My Profile
                </NavLink>

                <NavLink
                  to="/notifications"
                  className={styles.dropdownLink}
                  onClick={closeEverything}
                >
                  Notifications
                </NavLink>

                <NavLink
                  to="/my-submissions"
                  className={styles.dropdownLink}
                  onClick={closeEverything}
                >
                  My Submissions
                </NavLink>

                <NavLink
                  to="/team-requests"
                  className={styles.dropdownLink}
                  onClick={closeEverything}
                >
                  Team Requests
                </NavLink>

                {isPlayer && (
                  <NavLink
                    to="/organizer/apply"
                    className={styles.dropdownLink}
                    onClick={closeEverything}
                  >
                    Organizer Application
                  </NavLink>
                )}

                <button
                  className={styles.logoutBtn}
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
