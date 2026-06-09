const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        amount: {
            type: Number,
            required: true,
        },
        platformCommission: {
            type: Number, // Amount kept by platform
            default: 0,
        },
        restaurantPayout: {
            type: Number, // Amount sent to restaurant
            default: 0,
        },
        deliveryFeePayout: {
            type: Number, // Amount given to delivery system
            default: 0,
        },
        type: {
            type: String,
            enum: ["Payment", "Refund", "Payout"],
            default: "Payment",
        },
        status: {
            type: String,
            enum: ["Pending", "Success", "Failed"],
            default: "Pending",
        },
        gatewayOrderId: String,
        gatewayPaymentId: String,
        gateway: {
            type: String,
            enum: ["Stripe", "Razorpay", "Offline"],
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
