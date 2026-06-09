const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Razorpay = require("razorpay");
const Stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config();

let stripe, razorpay;

if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// @desc    Initialize a payment (Stripe Intent or Razorpay Order)
// @route   POST /api/payments/checkout
// @access  Private
const createPaymentIntent = async (req, res) => {
    try {
        const { orderId, method } = req.body;

        const order = await Order.findById(orderId).populate("restaurantId");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status !== "Pending" || order.paymentStatus === "Paid") {
            return res.status(400).json({ message: "Order cannot be paid for in its current state" });
        }

        const amountInSmallestUnit = Math.round(order.totalAmount * 100); // paisa (INR) or cents (USD)

        if (method === "Stripe" && stripe) {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInSmallestUnit,
                currency: "inr", // default to INR for foodie
                metadata: {
                    orderId: order._id.toString(),
                    userId: req.user.id,
                },
            });

            order.gatewayOrderId = paymentIntent.id;
            await order.save();

            return res.json({
                clientSecret: paymentIntent.client_secret,
                gateway: "Stripe"
            });

        } else if (method === "Razorpay" && razorpay) {
            const options = {
                amount: amountInSmallestUnit,
                currency: "INR",
                receipt: `receipt_${order._id.toString()}`,
            };

            const razorpayOrder = await razorpay.orders.create(options);

            order.gatewayOrderId = razorpayOrder.id;
            await order.save();

            return res.json({
                orderId: razorpayOrder.id,
                currency: razorpayOrder.currency,
                amount: razorpayOrder.amount,
                gateway: "Razorpay"
            });
        }

        // Fallback if keys are missing but payment was requested
        res.status(501).json({ message: "Payment gateway not fully configured or requested method is invalid." });

    } catch (error) {
        console.error("Payment init error:", error);
        res.status(500).json({ message: "Server error during payment initialization", error: error.message });
    }
};

// @desc    Verify payment success
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
    // In a robust production app, this should primarily be handled via secure webhooks
    // and server-to-server validation. For simplicity in this demo, we verify a token 
    // passed from the frontend.
    try {
        const { orderId, gatewayPaymentId, gateway } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // MOCK VERIFICATION for demo purposes.
        // In reality, you'd call stripe.paymentIntents.retrieve() or razorpay signature verification

        order.paymentStatus = "Paid";
        order.gatewayPaymentId = gatewayPaymentId;
        await order.save();

        // Create the Transaction ledger
        const platformCommission = (order.totalAmount * 0.15); // Hardcoded 15% platform fee for simple calc
        const restaurantPayout = order.totalAmount - platformCommission;

        await Transaction.create({
            orderId: order._id,
            restaurantId: order.restaurantId,
            userId: req.user.id,
            amount: order.totalAmount,
            platformCommission,
            restaurantPayout,
            status: "Success",
            gatewayOrderId: order.gatewayOrderId,
            gatewayPaymentId: gatewayPaymentId,
            gateway: gateway || "Offline"
        });

        res.json({ success: true, message: "Payment Verified", order });
    } catch (error) {
        res.status(500).json({ message: "Server error during payment verification", error: error.message });
    }
};

module.exports = {
    createPaymentIntent,
    verifyPayment,
};
