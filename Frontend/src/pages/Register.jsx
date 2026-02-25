import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./Register.module.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Registration successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["register-container"]}>
      <div className={styles["register-box"]}>
        <h2 className={styles["register-title"]}>Create Account</h2>
        <p className={styles["register-subtitle"]}>Join Foodie today</p>

        <form onSubmit={handleSubmit} className={styles["register-form"]}>
          <div>
            <label className={styles["register-label"]}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles["register-input"]}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className={styles["register-label"]}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles["register-input"]}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className={styles["register-label"]}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={styles["register-input"]}
              placeholder="Min 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={styles["register-btn"]}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className={styles["register-login"]}>
          Already have an account?{" "}
          <Link to="/login" className={styles["register-login-link"]}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
