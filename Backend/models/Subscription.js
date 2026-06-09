const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        planType: {
            type: String,
            enum: ["User_Monthly", "User_Yearly", "Restaurant_Monthly", "Restaurant_Yearly"],
            required: true,
        },
        entityId: {
            // User ID or Restaurant ID, depending on the planType
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Expired", "Cancelled"],
            default: "Active",
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: true,
        },
        transactionId: {
            // For mocking/tracking successful payment
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
