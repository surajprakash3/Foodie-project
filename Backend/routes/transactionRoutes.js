const express = require("express");
const router = express.Router();
const {
    getAllTransactions,
    getRestaurantTransactions
} = require("../controllers/transactionController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Super Admin route to view platform-wide ledger
router.get("/", protect, authorizeRoles("SuperAdmin"), getAllTransactions);

// Restaurant Admin route to view their specific payouts
router.get("/restaurant/:restaurantId", protect, authorizeRoles("SuperAdmin", "RestaurantAdmin"), getRestaurantTransactions);

module.exports = router;
