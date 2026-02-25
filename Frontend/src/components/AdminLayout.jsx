import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiShoppingBag,
  FiList,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { MdRestaurantMenu } from "react-icons/md";
import { useState } from "react";
import styles from "./AdminLayout.module.css";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login"); // logout
  };

  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <FiHome size={18} /> },
    { to: "/admin/foods", label: "Food Items", icon: <FiList size={18} /> },
    { to: "/admin/restaurants", label: "Restaurants", icon: <MdRestaurantMenu size={18} /> },
    { to: "/admin/orders", label: "Orders", icon: <FiShoppingBag size={18} /> },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className={styles["admin-root"]}>
      {/* Sidebar */}
      <aside
        className={
          styles["admin-sidebar"] + (sidebarOpen ? " " + styles["open"] : "")
        }
      >
        <div className={styles["admin-sidebar-header"]}>
          <span className={styles["admin-sidebar-title"]}>🍛 Admin Panel</span>
          <button className={styles["admin-sidebar-close"]} onClick={() => setSidebarOpen(false)}>
            <FiX size={20} />
          </button>
        </div>
        <nav className={styles["admin-nav"]}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={
                styles["admin-nav-link"] + (isActive(link.to) ? " " + styles["active"] : "")
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles["admin-sidebar-footer"]}>
          <div className={styles["admin-user"]}>{user?.name}</div>
          <button
            onClick={handleLogout}
            className={styles["admin-logout"]}
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles["admin-main"]}>
        {/* Top bar */}
        <header className={styles["admin-header"]}>
          <button className={styles["admin-header-btn"]} onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <h1 className={styles["admin-header-title"]}>Foodie Admin</h1>
        </header>

        {/* Content */}
        <main className={styles["admin-content"]}>{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className={styles["admin-overlay"]}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
