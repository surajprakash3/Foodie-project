import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles["navbar-inner"]}>
        <div className={styles["navbar-row"]}>
          {/* Logo */}
          <Link to="/" className={styles["navbar-logo"]}>
            <span>🍛Foodie</span>
          </Link>

          {/* Desktop Nav */}
          <div className={styles["navbar-links"]}>
            <Link to="/" className={styles["navbar-link"]}>
              Home
            </Link>
            {user ? (
              <>
                <Link to="/orders" className={styles["navbar-link"]}>
                  My Orders
                </Link>
                <Link to="/cart" className={styles["navbar-cart"]}>
                  <FiShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className={styles["navbar-cart-badge"]}>{cartCount}</span>
                  )}
                </Link>
                <div className={styles["navbar-user"]}>
                  <span className={styles["navbar-user-name"]}>
                    <FiUser size={16} />
                    <span>{user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className={styles["navbar-logout"]}
                  >
                    <FiLogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Link
                  to="/login"
                  className={styles["navbar-link"]}
                  style={{ background: "#fff", color: "#2563eb", padding: "0.375rem 1rem", borderRadius: "0.5rem", fontWeight: 500 }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={styles["navbar-link"]}
                  style={{ border: "1px solid #fff", padding: "0.375rem 1rem", borderRadius: "0.5rem", fontWeight: 500 }}
                >
                  Register
                </Link>
              </div>
            )}
            {/* Admin Login – always visible */}
            <Link
              to="/admin/login"
              className={styles["navbar-admin"]}
            >
              <span>🔐</span>
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button className={styles["navbar-mobile-btn"]} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className={styles["navbar-mobile-menu"]}>
            <Link to="/" onClick={() => setMobileOpen(false)} className={styles["navbar-mobile-link"]}>
              Home
            </Link>
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className={styles["navbar-mobile-link"]}>
                  My Orders
                </Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className={styles["navbar-mobile-link"]}>
                  Cart ({cartCount})
                </Link>
                <button onClick={handleLogout} className={styles["navbar-mobile-link"]} style={{ textAlign: "left", width: "100%", background: "none", border: "none" }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className={styles["navbar-mobile-link"]}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className={styles["navbar-mobile-link"]}>
                  Register
                </Link>
              </>
            )}
            <Link
              to="/admin/login"
              onClick={() => setMobileOpen(false)}
              className={styles["navbar-mobile-link"]}
              style={{ color: "#2563eb", fontWeight: 600 }}
            >
              🔐 Admin Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
