import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (location.pathname === "/login") {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <Link to="/tournaments" className={styles.logo}>
        Esports Battle
      </Link>

      <div className={styles.links}>
        <Link to="/tournaments" className={styles.link}>
          Tournaments
        </Link>

        {token && user && (
          <div className={styles.userBox}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.role}>{user.role}</span>
          </div>
        )}

        {token && (
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
