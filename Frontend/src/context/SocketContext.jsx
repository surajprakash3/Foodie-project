import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isRestaurantAdmin, isDeliveryAdmin } = useAuth();

    useEffect(() => {
        // Connect to Backend Socket.io server
        const URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5001";
        const newSocket = io(URL, {
            withCredentials: true,
            autoConnect: false // We connect manually below if user exists
        });

        if (user) {
            newSocket.connect();
            setSocket(newSocket);

            newSocket.on("connect", () => {
                console.log("Connected to Socket Server", newSocket.id);

                // 1. All authenticated users join their personal room to track order status
                newSocket.emit("joinUserRoom", user._id);

                // 2. Restaurant Admins join their restaurant's room to receive new orders
                if (isRestaurantAdmin && user.restaurantId) {
                    newSocket.emit("joinRestaurantRoom", user.restaurantId);
                }

                // 3. Delivery Admins join a global delivery room to see unassigned orders
                if (isDeliveryAdmin) {
                    newSocket.emit("joinDeliveryRoom");
                }
            });
        }

        // Cleanup on unmount or user logout
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user, isRestaurantAdmin, isDeliveryAdmin]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
