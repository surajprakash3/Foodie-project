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
  const { user, logout, isSuperAdmin, isRestaurantAdmin, isDeliveryAdmin, isDeliveryBoy } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [];

  if (isSuperAdmin) {
    links.push({ to: "/admin/dashboard", label: "Overview", icon: <FiHome size={18} /> });
    links.push({ to: "/admin/restaurants", label: "Restaurants", icon: <MdRestaurantMenu size={18} /> });
    links.push({ to: "/admin/foods", label: "All Foods", icon: <FiList size={18} /> });
    links.push({ to: "/admin/orders", label: "All Orders", icon: <FiShoppingBag size={18} /> });
  } else if (isRestaurantAdmin) {
    links.push({ to: "/admin/dashboard", label: "My Dashboard", icon: <FiHome size={18} /> });
    links.push({ to: "/admin/foods", label: "My Menu", icon: <FiList size={18} /> });
    links.push({ to: "/admin/orders", label: "My Orders", icon: <FiShoppingBag size={18} /> });
  } else if (isDeliveryAdmin || isDeliveryBoy) {
    links.push({ to: "/admin/dashboard", label: "Dashboard", icon: <FiHome size={18} /> });
    links.push({ to: "/admin/delivery", label: "Deliveries", icon: <FiShoppingBag size={18} /> });
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  // Display role badge
  const getRoleBadge = () => {
    if (isSuperAdmin) return "Super Admin";
    if (isRestaurantAdmin) return "Restaurant";
    if (isDeliveryAdmin) return "Delivery Admin";
    if (isDeliveryBoy) return "Delivery Boy";
    return "Admin";
  };

  return (
    <div className={styles["admin-root"]}>
      {/* Sidebar */}
      <aside
        className={
          styles["admin-sidebar"] + (sidebarOpen ? " " + styles["open"] : "")
        }
      >
        <div className={styles["admin-sidebar-header"]}>
          <span className={styles["admin-sidebar-title"]}>🍛 Foodie</span>
          <button className={styles["admin-sidebar-close"]} onClick={() => setSidebarOpen(false)}>
            <FiX size={20} />
          </button>
        </div>
        <div className={styles["admin-role-badge"]}>{getRoleBadge()}</div>
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
