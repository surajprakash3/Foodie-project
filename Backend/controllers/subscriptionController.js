const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Transaction = require("../models/Transaction"); // For logging the payment

// Helper to calculate end date
const calculateEndDate = (planType) => {
    const date = new Date();
    if (planType.includes("Monthly")) {
        date.setMonth(date.getMonth() + 1);
    } else if (planType.includes("Yearly")) {
        date.setFullYear(date.getFullYear() + 1);
    }
    return date;
};

// @desc    Subscribe to a premium plan
// @route   POST /api/subscriptions
// @access  User, RestaurantAdmin
const subscribe = async (req, res) => {
    try {
        const { planType, amount, paymentMethodId } = req.body;

        // In a real app, integrate Stripe/Razorpay here using paymentMethodId
        // For demo purposes, we assume successful payment.

        const endDate = calculateEndDate(planType);
        let entityId = req.user._id;
        let isUserPlan = planType.startsWith("User");

        // If it's a restaurant plan, we need the restaurant ID. 
        // Assuming RestaurantAdmin can only subscribe for their own restaurant.
        if (!isUserPlan) {
            if (req.user.role !== "RestaurantAdmin") {
                return res.status(403).json({ message: "Only Restaurant Admins can purchase restaurant plans" });
            }
            const restaurant = await Restaurant.findOne({ adminId: req.user._id });
            if (!restaurant) {
                return res.status(404).json({ message: "Restaurant not found for this admin" });
            }
            entityId = restaurant._id;
        }

        const subscription = await Subscription.create({
            planType,
            entityId,
            amount,
            endDate,
            transactionId: "sub_txn_" + Date.now() // mock transaction ID
        });

        // Create a transaction ledger entry for platform revenue
        await Transaction.create({
            userId: req.user._id, // User paying
            restaurantId: isUserPlan ? null : entityId, // Null if user plan, Rest ID if rest plan
            totalAmount: amount,
            platformCommission: amount, // 100% goes to platform
            restaurantPayout: 0,
            paymentMethod: "Online",
            status: "Success",
            paymentGateway: "MockGateway",
            gatewayPaymentId: subscription.transactionId,
        });

        // Update entity premium status
        if (isUserPlan) {
            await User.findByIdAndUpdate(entityId, {
                isPremium: true,
                premiumExpiryDate: endDate
            });
            // Updating req.user in memory just in case
            req.user.isPremium = true;
            req.user.premiumExpiryDate = endDate;
        } else {
            await Restaurant.findByIdAndUpdate(entityId, {
                isPremium: true,
                // Could add a premiumExpiryDate field to Restaurant schema too
            });
        }

        res.status(201).json({ message: "Subscription successful 🚀", subscription });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get subscription status
// @route   GET /api/subscriptions/status
// @access  User, RestaurantAdmin
const getSubscriptionStatus = async (req, res) => {
    try {
        let entityId = req.user._id;
        let isUserParams = req.query.type !== "restaurant";

        if (!isUserParams && req.user.role === "RestaurantAdmin") {
            const restaurant = await Restaurant.findOne({ adminId: req.user._id });
            if (restaurant) entityId = restaurant._id;
        }

        const activeSubscription = await Subscription.findOne({
            entityId,
            status: "Active",
            endDate: { $gt: new Date() } // hasn't expired
        }).sort({ createdAt: -1 });

        res.json({
            hasActiveSubscription: !!activeSubscription,
            subscription: activeSubscription
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { subscribe, getSubscriptionStatus };
