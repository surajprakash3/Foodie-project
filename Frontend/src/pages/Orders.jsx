import { useEffect, useState } from "react";
import API from "../utils/api";
import { FiPackage, FiClock } from "react-icons/fi";
import styles from "./Orders.module.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/user");
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>My Orders</h1>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <FiPackage size={64} className={styles.emptyIcon} />
          <h2>No orders yet</h2>
          <p>Your order history will appear here.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => {
            let statusClass = styles.status;

            if (order.status === "Pending") statusClass += ` ${styles.pending}`;
            else if (order.status === "Preparing") statusClass += ` ${styles.preparing}`;
            else if (order.status === "Out for Delivery") statusClass += ` ${styles.out}`;
            else if (order.status === "Delivered") statusClass += ` ${styles.delivered}`;
            else if (order.status === "Cancelled") statusClass += ` ${styles.cancelled}`;

            return (
              <div key={order._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.orderId}>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <div className={styles.date}>
                      <FiClock size={14} />
                      <span>
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <span className={statusClass}>
                    {order.status}
                  </span>
                </div>

                <div className={styles.items}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.footer}>
                  <div className={styles.footerInfo}>
                    <span>📍 {order.deliveryAddress}</span>
                    <span>💳 {order.paymentMethod}</span>
                  </div>

                  <p className={styles.total}>
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;