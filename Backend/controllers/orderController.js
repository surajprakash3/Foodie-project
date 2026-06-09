const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { getIo } = require("../socket");

// @desc    Place order from cart
// @route   POST /api/orders
// @access  User
const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;

    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const cart = await Cart.findOne({ userId: req.user._id }).populate("items.foodId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Build order items snapshot
    const orderItems = cart.items.map((item) => ({
      foodId: item.foodId._id,
      name: item.foodId.name,
      price: item.foodId.price,
      quantity: item.quantity,
      image: item.foodId.image || "",
    }));

    const order = await Order.create({
      userId: req.user._id,
      restaurantId: cart.restaurantId,
      items: orderItems,
      itemTotal: cart.itemTotal,
      taxAmount: cart.taxAmount,
      deliveryFee: cart.deliveryFee,
      discountAmount: cart.discountAmount,
      totalAmount: cart.totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "Online" ? "Pending" : "Pending", // For online payments, wait for gateway
      status: "Pending",
    });

    // Clear cart after ordering
    cart.items = [];
    cart.restaurantId = null;
    cart.itemTotal = 0;
    cart.taxAmount = 0;
    cart.deliveryFee = 0;
    cart.discountAmount = 0;
    cart.totalAmount = 0;
    await cart.save();

    // Emit socket event to the specific Restaurant Admin's room
    try {
      const io = getIo();
      io.to(`restaurant_${order.restaurantId}`).emit("newOrder", order);
      io.to("delivery_admin_room").emit("newOrderPending", order); // Alert delivery admins
    } catch (socketErr) {
      console.error("Socket error on placeOrder:", socketErr);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/user
// @access  User
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // Emit real-time status update to the User who placed the order
    try {
      const io = getIo();
      io.to(`user_${order.userId}`).emit("orderStatusUpdated", {
        orderId: order._id,
        status: order.status
      });
    } catch (socketErr) {
      console.error("Socket error on updateOrderStatus:", socketErr);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get orders for delivery
// @route   GET /api/orders/delivery
// @access  DeliveryAdmin, DeliveryBoy
const getDeliveryOrders = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "DeliveryBoy") {
      filter = {
        $or: [
          { deliveryBoyId: req.user._id }, // assigned to me
          { deliveryBoyId: { $exists: false }, status: { $in: ["Preparing", "Ready"] } } // or unassigned and ready/preparing
        ]
      };
    } else if (req.user.role === "DeliveryAdmin") {
      filter = {}; // admins see all
    }

    const orders = await Order.find(filter)
      .populate("restaurantId", "name address")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Assign order to delivery boy
// @route   PUT /api/orders/:id/assign
// @access  DeliveryAdmin, DeliveryBoy
const assignDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If DeliveryBoy, self-assign. If DeliveryAdmin, passed in body.
    const assignTo = req.user.role === "DeliveryBoy" ? req.user._id : req.body.deliveryBoyId;

    order.deliveryBoyId = assignTo;
    order.status = "Out for Delivery";
    await order.save();

    try {
      const io = getIo();
      io.to(`user_${order.userId}`).emit("orderStatusUpdated", {
        orderId: order._id,
        status: order.status
      });
      io.to(`restaurant_${order.restaurantId}`).emit("orderStatusUpdated", {
        orderId: order._id,
        status: order.status
      });
    } catch (socketErr) {
      console.error("Socket error on assignDelivery:", socketErr);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, getDeliveryOrders, assignDelivery };
