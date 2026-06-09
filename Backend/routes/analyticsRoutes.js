const express = require("express");
const router = express.Router();
const { getPlatformAnalytics, getRestaurantAnalytics } = require("../controllers/analyticsController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Platform-wide metrics
router.get("/platform", protect, authorizeRoles("SuperAdmin"), getPlatformAnalytics);

// Restaurant specific metrics
router.get("/restaurant/:restaurantId", protect, authorizeRoles("SuperAdmin", "RestaurantAdmin"), getRestaurantAnalytics);

module.exports = router;
