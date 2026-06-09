const Transaction = require("../models/Transaction");

// @desc    Get all transactions (Super Admin)
// @route   GET /api/transactions
// @access  SuperAdmin
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate("orderId", "totalAmount status paymentStatus")
            .populate("restaurantId", "name")
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get transactions for a specific restaurant (Restaurant Admin)
// @route   GET /api/transactions/restaurant/:restaurantId
// @access  RestaurantAdmin, SuperAdmin
const getRestaurantTransactions = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        // In a real app, verify the RestaurantAdmin making the request actually owns this restaurant
        const transactions = await Transaction.find({ restaurantId })
            .populate("orderId", "totalAmount status paymentStatus")
            .sort({ createdAt: -1 });

        const totalPayouts = transactions.reduce((acc, curr) => curr.status === 'Success' ? acc + curr.restaurantPayout : acc, 0);

        res.json({
            transactions,
            summary: {
                totalPayouts
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getAllTransactions,
    getRestaurantTransactions
};
