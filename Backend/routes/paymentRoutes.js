const express = require("express");
const router = express.Router();
const {
    createPaymentIntent,
    verifyPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// Route to initialize payment (returns Stripe Client Secret or Razorpay Order ID)
router.post("/checkout", protect, createPaymentIntent);

// Route to verify the completed payment
router.post("/verify", protect, verifyPayment);

// Note: In a true production environment, you would also want raw body webhook endpoints here,
// e.g., router.post("/webhook/stripe", express.raw({type: 'application/json'}), stripeWebhook);

module.exports = router;
