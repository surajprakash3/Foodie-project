const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// @desc    Get Super Admin Platform Analytics
// @route   GET /api/analytics/platform
// @access  SuperAdmin
const getPlatformAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "User" });
        const totalRestaurants = await Restaurant.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Calculate Platform Revenue (from transactions)
        const transactions = await Transaction.find({ status: "Success" });
        const totalRevenue = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const platformCommission = transactions.reduce((acc, curr) => acc + curr.platformCommission, 0);

        // Recent 5 orders for activity feed
        const recentOrders = await Order.find()
            .populate("restaurantId", "name")
            .populate("userId", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalUsers,
            totalRestaurants,
            totalOrders,
            totalRevenue,
            platformCommission,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get Restaurant Specific Analytics
// @route   GET /api/analytics/restaurant/:restaurantId
// @access  RestaurantAdmin, SuperAdmin
const getRestaurantAnalytics = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const totalOrders = await Order.countDocuments({ restaurantId });

        // Revenue and payouts
        const transactions = await Transaction.find({ restaurantId, status: "Success" });
        const totalRevenue = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalPayouts = transactions.reduce((acc, curr) => acc + curr.restaurantPayout, 0);

        // Top Selling Items Aggregation
        const topItems = await Order.aggregate([
            { $match: { restaurantId: require('mongoose').Types.ObjectId(restaurantId) } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.foodId",
                    name: { $first: "$items.name" },
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Daily revenue for charts (last 7 days mapping)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyRevenueRaw = await Order.aggregate([
            {
                $match: {
                    restaurantId: require('mongoose').Types.ObjectId(restaurantId),
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalOrders,
            totalRevenue,
            totalPayouts,
            topItems,
            dailyRevenue: dailyRevenueRaw
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getPlatformAnalytics, getRestaurantAnalytics };
