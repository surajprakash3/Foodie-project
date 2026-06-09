import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./AdminLogin.module.css";

const ADMIN_ROLES = ["SuperAdmin", "RestaurantAdmin", "DeliveryAdmin", "DeliveryBoy"];

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);

      if (!user || !ADMIN_ROLES.includes(user.role)) {
        toast.error("Access denied. Admin only.");
        setLoading(false);
        return;
      }

      toast.success(`Welcome ${user.role === "SuperAdmin" ? "Super Admin" : user.role}!`);

      // Route each role to the correct page
      if (user.role === "DeliveryBoy" || user.role === "DeliveryAdmin") {
        navigate("/admin/delivery");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.bg}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>🍛</div>
          <h2 className={styles.title}>Admin Login</h2>
          <p className={styles.subtitle}>
            Foodie Management Panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@foodie.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.footer}>
          © {new Date().getFullYear()} Foodie
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;