import { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { useSocket } from "../../context/SocketContext";
import { FiMapPin, FiPackage, FiCheck } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const DeliveryOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const socket = useSocket();

    const fetchOrders = async () => {
        try {
            const { data } = await API.get("/orders/delivery");
            setOrders(data);
        } catch {
            toast.error("Failed to load delivery orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Listen for new pending orders globally dropped into the delivery pool
        const handleNewOrder = (order) => {
            setOrders(prev => [order, ...prev]);
            toast.success("New Delivery Assignment Available! 🛵", { icon: '🛵' });
        };

        socket.on("newOrderPending", handleNewOrder);

        return () => {
            socket.off("newOrderPending", handleNewOrder);
        };
    }, [socket]);

    const handleAssign = async (orderId) => {
        try {
            await API.put(`/orders/${orderId}/assign`);
            toast.success("Order Claimed! Drive safely.");
            fetchOrders();
        } catch {
            toast.error("Failed to claim order");
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await API.put(`/orders/${orderId}/status`, { status });
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch {
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Delivery Dashboard</h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-500">
                    <FiPackage size={48} className="mx-auto mb-4 text-slate-300" />
                    <p>No orders available for delivery at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => {
                        const isAssignedToMe = order.deliveryBoyId === user?._id;
                        const isUnassigned = !order.deliveryBoyId;

                        return (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-sm text-slate-500">#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${isAssignedToMe ? 'bg-indigo-100 text-indigo-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <h4 className="text-xs uppercase text-slate-400 font-bold mb-1">Pickup From</h4>
                                            <p className="font-medium text-slate-800 flex items-start gap-2">
                                                <FiMapPin className="text-red-500 mt-1 flex-shrink-0" />
                                                <span>{order.restaurantId?.name || "Unknown"} <br /><span className="text-xs text-slate-500 font-normal">{order.restaurantId?.address}</span></span>
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs uppercase text-slate-400 font-bold mb-1">Deliver To</h4>
                                            <p className="font-medium text-slate-800 flex items-start gap-2">
                                                <FiMapPin className="text-blue-500 mt-1 flex-shrink-0" />
                                                <span>{order.userId?.name || "Customer"} <br /><span className="text-xs text-slate-500 font-normal">{order.deliveryAddress}</span></span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {isUnassigned ? (
                                        <button
                                            onClick={() => handleAssign(order._id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                                        >
                                            Claim Order
                                        </button>
                                    ) : isAssignedToMe ? (
                                        <>
                                            {order.status !== "Delivered" && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, "Delivered")}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition flex justify-center items-center gap-2"
                                                >
                                                    <FiCheck /> Mark Delivered
                                                </button>
                                            )}
                                        </>
                                    ) : null}
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DeliveryOrders;
