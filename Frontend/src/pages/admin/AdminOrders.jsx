import { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FiClock } from "react-icons/fi";

const statusOptions = [
  "Pending",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const statusColors = {
  Pending:
    "bg-yellow-50 text-yellow-700 border-yellow-300",
  Preparing:
    "bg-blue-50 text-blue-700 border-blue-300",
  "Out for Delivery":
    "bg-indigo-50 text-indigo-700 border-indigo-300",
  Delivered:
    "bg-emerald-50 text-emerald-700 border-emerald-300",
  Cancelled:
    "bg-red-50 text-red-700 border-red-300",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] =
    useState("All");

  const fetchOrders = async () => {
    try {
      const { data } =
        await API.get("/orders/admin");
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    try {
      await API.put(
        `/orders/${orderId}/status`,
        { status: newStatus }
      );
      toast.success(
        `Updated to ${newStatus}`
      );
      fetchOrders();
    } catch {
      toast.error("Update failed");
    }
  };

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter(
          (o) => o.status === filterStatus
        );

  /* ───────── Loading ───────── */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Title */}
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Orders Management
      </h1>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {["All", ...statusOptions].map(
          (status) => (
            <button
              key={status}
              onClick={() =>
                setFilterStatus(status)
              }
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                filterStatus === status
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-blue-50"
              }`}
            >
              {status}
              {status === "All"
                ? ` (${orders.length})`
                : ` (${
                    orders.filter(
                      (o) =>
                        o.status === status
                    ).length
                  })`}
            </button>
          )
        )}
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-10 text-center text-slate-500">
          No orders found.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white/90 backdrop-blur rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-6 border border-slate-100"
            >
              {/* Header */}
              <div className="flex flex-wrap justify-between items-start mb-5">
                <div>
                  <p className="font-mono text-xs text-slate-400">
                    #
                    {order._id
                      .slice(-8)
                      .toUpperCase()}
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {order.userId?.name ||
                      "Unknown"}
                    <span className="text-slate-400 font-normal ml-2">
                      (
                      {order.userId?.email ||
                        "N/A"}
                      )
                    </span>
                  </p>

                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <FiClock
                      size={14}
                      className="mr-1"
                    />
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
                      statusColors[
                        order.status
                      ]
                    }`}
                  >
                    {order.status}
                  </span>

                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order._id,
                        e.target.value
                      )
                    }
                    className="text-sm border border-slate-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {statusOptions.map(
                      (s) => (
                        <option
                          key={s}
                          value={s}
                        >
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-5">
                {order.items.map(
                  (item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm bg-slate-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-slate-600">
                        {item.name} ×{" "}
                        {item.quantity}
                      </span>
                      <span className="font-medium text-slate-700">
                        ₹
                        {item.price *
                          item.quantity}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Footer */}
              <div className="border-t pt-4 flex flex-wrap justify-between items-center">
                <div className="text-sm text-slate-500">
                  📍 {order.deliveryAddress} | 💳{" "}
                  {order.paymentMethod}
                </div>

                <p className="text-xl font-bold text-blue-600">
                  ₹{order.totalAmount}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;