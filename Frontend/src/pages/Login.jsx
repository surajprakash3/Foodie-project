import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Login successful!");
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-box"]}>
        <h2 className={styles["login-title"]}>Welcome Back</h2>
        <p className={styles["login-subtitle"]}>Sign in to your account</p>

        <form onSubmit={handleSubmit} className={styles["login-form"]}>
          <div>
            <label className={styles["login-label"]}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles["login-input"]}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className={styles["login-label"]}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles["login-input"]}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={styles["login-btn"]}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className={styles["login-register"]}>
          Don't have an account?{" "}
          <Link to="/register" className={styles["login-register-link"]}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
