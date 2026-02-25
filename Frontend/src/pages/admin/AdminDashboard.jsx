import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiShoppingBag, FiPackage } from "react-icons/fi";
import { MdRestaurantMenu } from "react-icons/md";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    restaurants: 0,
    orders: 0,
    pending: 0,
    delivered: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resData, orderData] = await Promise.all([
          API.get("/restaurants"),
          API.get("/orders/admin"),
        ]);

        const orders = orderData.data;

        setStats({
          restaurants: resData.data.length,
          orders: orders.length,
          pending: orders.filter((o) => o.status === "Pending").length,
          delivered: orders.filter((o) => o.status === "Delivered").length,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Restaurants",
      value: stats.restaurants,
      icon: <MdRestaurantMenu size={26} />,
      color: "blue",
    },
    {
      label: "Total Orders",
      value: stats.orders,
      icon: <FiShoppingBag size={26} />,
      color: "green",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <FiPackage size={26} />,
      color: "yellow",
    },
    {
      label: "Delivered",
      value: stats.delivered,
      icon: <FiPackage size={26} />,
      color: "emerald",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>

      {/* Stat Cards */}
      <div className={styles.cards}>
        {statCards.map((stat) => (
          <div key={stat.label} className={styles.card}>
            <div
              className={`${styles.cardIcon} ${styles[stat.color]}`}
            >
              {stat.icon}
            </div>

            <div>
              <p className={styles.cardValue}>{stat.value}</p>
              <p className={styles.cardLabel}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Orders</h2>

        {recentOrders.length === 0 ? (
          <p className={styles.empty}>No orders yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className={styles.orderId}>
                      {order._id.slice(-8).toUpperCase()}
                    </td>
                    <td>{order.userId?.name || "N/A"}</td>
                    <td className={styles.amount}>
                      ₹{order.totalAmount}
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          styles[
                            order.status
                              .toLowerCase()
                              .replace(/\s/g, "")
                          ]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className={styles.date}>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;