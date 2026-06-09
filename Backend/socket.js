const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: (process.env.CLIENT_URL || "http://localhost:5173").split(","),
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Join a room for a specific user to receive their own order updates
        socket.on("joinUserRoom", (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        // Join a room for a specific restaurant (for Restaurant Admins)
        socket.on("joinRestaurantRoom", (restaurantId) => {
            socket.join(`restaurant_${restaurantId}`);
            console.log(`Restaurant ${restaurantId} room joined`);
        });

        // Delivery Admins can join a global delivery room
        socket.on("joinDeliveryRoom", () => {
            socket.join("delivery_admin_room");
            console.log("Delivery Admin joined delivery room");
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
