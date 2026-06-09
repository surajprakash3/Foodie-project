const router = require("express").Router();
const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getDeliveryOrders,
  assignDelivery
} = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, placeOrder);
router.get("/user", protect, getUserOrders);

// Delivery specific routes
router.get("/delivery", protect, authorizeRoles("DeliveryAdmin", "DeliveryBoy"), getDeliveryOrders);
router.put("/:id/assign", protect, authorizeRoles("DeliveryAdmin", "DeliveryBoy"), assignDelivery);

router.get("/admin", protect, authorizeRoles("SuperAdmin", "RestaurantAdmin", "DeliveryAdmin"), getAllOrders);
router.put("/:id/status", protect, authorizeRoles("SuperAdmin", "RestaurantAdmin", "DeliveryAdmin", "DeliveryBoy"), updateOrderStatus);

module.exports = router;
