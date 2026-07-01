import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useToast } from "../components/ui/useToast";
import styles from "./Login.module.css";

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [authMode, setAuthMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState("player");

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

  const selectRole = (role) => {
    setSelectedRole(role);
    setError("");
  };

  const getUserFromResponse = (data) => {
    return (
      data.user ||
      data.loggedInUser || {
        _id: data.userId || data._id,
        name: data.name,
        email: data.email,
        role: data.role || selectedRole,
        ign: data.ign,
        bgmiUID: data.bgmiUID,
      }
    );
  };

  const saveAuthData = (responseData) => {
    const authData = responseData.data || responseData;

    const token = authData.token || authData.accessToken;
    const user = authData.user || getUserFromResponse(authData);

    if (!token) {
      throw new Error("Token not received from server");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
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

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
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

    if (user.role !== selectedRole) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      throw new Error(
        `This account is registered as ${user.role}. Please select Login as ${user.role}.`,
      );
    }

    toast.success(`Logged in as ${user.role}`);

    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/tournaments");
    }
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: selectedRole,
      ign: formData.ign.trim(),
      bgmiUID: formData.bgmiUID.trim(),
    };

    const res = await API.post("/auth/register", payload);

    const token = res.data.token || res.data.accessToken;

    if (token) {
      const user = saveAuthData(res.data);

      toast.success(`Account created as ${user.role}`);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/tournaments");
      }

      return;
    }

    toast.success("Account created successfully. Please login now.");
    setAuthMode("login");
    setFormData({
      name: "",
      email: formData.email,
      password: "",
      ign: "",
      bgmiUID: "",
    });
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
            and track leaderboards. Admins can manage tournaments, users, match
            rooms, and result approvals.
          </p>

          <div className={styles.featureGrid}>
            <div>
              <span>01</span>
              <strong>Team Registration</strong>
              <p>Create or join esports teams.</p>
            </div>

            <div>
              <span>02</span>
              <strong>Admin Controls</strong>
              <p>Manage tournaments and results.</p>
            </div>

            <div>
              <span>03</span>
              <strong>Leaderboard</strong>
              <p>Track approved match points.</p>
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

          <div className={styles.roleSelector}>
            <button
              type="button"
              className={selectedRole === "player" ? styles.activeRole : ""}
              onClick={() => selectRole("player")}
            >
              Player
            </button>

            <button
              type="button"
              className={selectedRole === "admin" ? styles.activeRole : ""}
              onClick={() => selectRole("admin")}
            >
              Admin
            </button>
          </div>

          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>
              {isLoginMode ? "Welcome Back" : "Create Account"}
            </p>

            <h2>
              {isLoginMode
                ? `Login as ${selectedRole}`
                : `Signup as ${selectedRole}`}
            </h2>

            <p>
              {isLoginMode
                ? "Access your esports dashboard with your registered account."
                : "Create your account and start using the platform."}
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
                  ? `Login as ${selectedRole}`
                  : `Signup as ${selectedRole}`}
            </button>
          </form>

          <p className={styles.switchText}>
            {isLoginMode ? "Don't have an account?" : "Already have account?"}{" "}
            <button
              type="button"
              onClick={() => switchAuthMode(isLoginMode ? "signup" : "login")}
            >
              {isLoginMode ? "Create one" : "Login here"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
