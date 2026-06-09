import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiShoppingBag } from "react-icons/fi";
import { MdRestaurantMenu, MdAttachMoney } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const { isSuperAdmin, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (isSuperAdmin) {
          const { data } = await API.get("/analytics/platform");
          setStats(data);
        } else {
          if (user?.restaurantId) {
            const { data } = await API.get(`/analytics/restaurant/${user.restaurantId}`);
            setStats(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isSuperAdmin, user]);

  if (loading || !stats) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // Super Admin view
  if (isSuperAdmin) {
    return (
      <div className={styles.dashboard}>
        <h1 className={styles.title}>Platform Analytics</h1>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.blue}`}><MdRestaurantMenu size={26} /></div>
            <div><p className={styles.cardValue}>{stats.totalRestaurants}</p><p className={styles.cardLabel}>Restaurants</p></div>
          </div>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.green}`}><FiShoppingBag size={26} /></div>
            <div><p className={styles.cardValue}>{stats.totalOrders}</p><p className={styles.cardLabel}>Total Orders</p></div>
          </div>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.emerald}`}><MdAttachMoney size={26} /></div>
            <div><p className={styles.cardValue}>₹{stats.totalRevenue.toLocaleString()}</p><p className={styles.cardLabel}>Platform Volume</p></div>
          </div>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.yellow}`}><MdAttachMoney size={26} /></div>
            <div><p className={styles.cardValue}>₹{stats.platformCommission.toLocaleString()}</p><p className={styles.cardLabel}>Total Commission</p></div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Orders (Platform Wide)</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th><th>Restaurant</th><th>Customer</th><th>Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.map((order) => (
                  <tr key={order._id}>
                    <td className={styles.orderId}>{order._id.slice(-8).toUpperCase()}</td>
                    <td>{order.restaurantId?.name || "N/A"}</td>
                    <td>{order.userId?.name || "N/A"}</td>
                    <td className={styles.amount}>₹{order.totalAmount}</td>
                    <td>
                      <span className={`${styles.status} ${order.status === 'Delivered' ? styles.delivered : styles.pending}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Restaurant Admin view
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Restaurant Dashboard</h1>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={`${styles.cardIcon} ${styles.blue}`}><FiShoppingBag size={26} /></div>
          <div><p className={styles.cardValue}>{stats.totalOrders}</p><p className={styles.cardLabel}>Total Orders</p></div>
        </div>
        <div className={styles.card}>
          <div className={`${styles.cardIcon} ${styles.emerald}`}><MdAttachMoney size={26} /></div>
          <div><p className={styles.cardValue}>₹{stats.totalRevenue.toLocaleString()}</p><p className={styles.cardLabel}>Gross Sales</p></div>
        </div>
        <div className={styles.card}>
          <div className={`${styles.cardIcon} ${styles.green}`}><MdAttachMoney size={26} /></div>
          <div><p className={styles.cardValue}>₹{(stats.totalPayouts || 0).toLocaleString()}</p><p className={styles.cardLabel}>Net Earnings</p></div>
        </div>
      </div>

      <div className={styles.chartGrid}>

        {/* Revenue Chart */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Revenue - Last 7 Days</h2>
          <div className={styles.chartArea}>
            {stats.dailyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>Not enough data to graph</div>
            )}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Top Selling Items</h2>
          {stats.topItems?.length > 0 ? (
            <div className={styles.topItemsList}>
              {stats.topItems.map((item, idx) => (
                <div key={item._id} className={styles.topItem}>
                  <div className={styles.topItemLeft}>
                    <div className={styles.topItemRank}>#{idx + 1}</div>
                    <div>
                      <h4 className={styles.topItemName}>{item.name}</h4>
                      <p className={styles.topItemSold}>{item.totalSold} units sold</p>
                    </div>
                  </div>
                  <div className={styles.topItemRevenue}>
                    ₹{item.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyChart}>No items sold yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;