const express = require("express");
const router = express.Router();
const { subscribe, getSubscriptionStatus } = require("../controllers/subscriptionController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Any logged-in user can check their status or subscribe
router.post("/", protect, authorizeRoles("User", "RestaurantAdmin"), subscribe);
router.get("/status", protect, getSubscriptionStatus);

module.exports = router;
