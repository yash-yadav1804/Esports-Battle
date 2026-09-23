import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useToast } from "../components/ui/useToast";
import styles from "./Login.module.css";

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [authMode, setAuthMode] = useState("login");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    ign: "",
    bgmiUID: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLoginMode = authMode === "login";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const resetFormMessage = () => {
    setError("");
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setError("");
  };

  const saveAuthData = (responseData) => {
    const authData = responseData.data || responseData;

    const token = authData.token || authData.accessToken;
    const user = authData.user;

    if (!token || !user) {
      throw new Error("Invalid auth response from server");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  };

  const redirectUserByRole = (user) => {
    if (user.role === "admin" || user.role === "superAdmin") {
      navigate("/admin/dashboard");
      return;
    }

    if (user.role === "organizer") {
      navigate("/tournaments");
      return;
    }

    navigate("/tournaments");
  };

  const validateLogin = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }

    return true;
  };

  const validateSignup = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }

    if (!formData.ign.trim()) {
      setError("IGN is required");
      return false;
    }

    if (!formData.bgmiUID.trim()) {
      setError("BGMI UID is required");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    const res = await API.post("/auth/login", {
      email: formData.email.trim(),
      password: formData.password,
    });

    const user = saveAuthData(res.data);

    toast.success(`Logged in as ${user.role}`);
    redirectUserByRole(user);
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      ign: formData.ign.trim(),
      bgmiUID: formData.bgmiUID.trim(),
    };

    const res = await API.post("/auth/register", payload);

    const user = saveAuthData(res.data);

    toast.success("Player account created successfully");
    redirectUserByRole(user);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (isLoginMode) {
        await handleLogin();
      } else {
        await handleSignup();
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.authShell}>
        <div className={styles.brandPanel}>
          <div className={styles.logoRow}>
            <span className={styles.logoMark}>E</span>
            <strong>Esports Battle</strong>
          </div>

          <h1>Manage BGMI tournaments like a pro.</h1>

          <p>
            Players can create teams, register for tournaments, submit results,
            and track leaderboards. Approved organizers and admins can manage
            tournaments, match rooms, and results.
          </p>

          <div className={styles.featureGrid}>
            <div>
              <span>01</span>
              <strong>Players</strong>
              <p>Create teams and join tournaments.</p>
            </div>

            <div>
              <span>02</span>
              <strong>Organizers</strong>
              <p>Host tournaments after approval.</p>
            </div>

            <div>
              <span>03</span>
              <strong>Admins</strong>
              <p>Control platform and approvals.</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.modeTabs}>
            <button
              type="button"
              className={isLoginMode ? styles.activeTab : ""}
              onClick={() => switchAuthMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={!isLoginMode ? styles.activeTab : ""}
              onClick={() => switchAuthMode("signup")}
            >
              Signup
            </button>
          </div>

          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>
              {isLoginMode ? "Welcome Back" : "Create Player Account"}
            </p>

            <h2>{isLoginMode ? "Login to Account" : "Signup as Player"}</h2>

            <p>
              {isLoginMode
                ? "Enter your email and password. We will automatically open your dashboard based on your role."
                : "Create a player account first. You can request organizer access later from your profile."}
            </p>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <form className={styles.form} onSubmit={handleSubmit}>
            {!isLoginMode && (
              <input
                className={styles.input}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={resetFormMessage}
                placeholder="Full name"
              />
            )}

            <input
              className={styles.input}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={resetFormMessage}
              placeholder="Email address"
            />

            <input
              className={styles.input}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={resetFormMessage}
              placeholder="Password"
            />

            {!isLoginMode && (
              <>
                <input
                  className={styles.input}
                  type="text"
                  name="ign"
                  value={formData.ign}
                  onChange={handleChange}
                  onFocus={resetFormMessage}
                  placeholder="IGN / In-game name"
                />

                <input
                  className={styles.input}
                  type="text"
                  name="bgmiUID"
                  value={formData.bgmiUID}
                  onChange={handleChange}
                  onFocus={resetFormMessage}
                  placeholder="BGMI UID"
                />
              </>
            )}

            <button className={styles.button} type="submit" disabled={loading}>
              {loading
                ? isLoginMode
                  ? "Logging in..."
                  : "Creating account..."
                : isLoginMode
                  ? "Login"
                  : "Create Player Account"}
            </button>
          </form>

          <p className={styles.switchText}>
            {isLoginMode ? "Don't have an account?" : "Already have account?"}{" "}
            <button
              type="button"
              onClick={() => switchAuthMode(isLoginMode ? "signup" : "login")}
            >
              {isLoginMode ? "Create player account" : "Login here"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
