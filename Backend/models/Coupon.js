const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            trim: true,
            uppercase: true,
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            default: "percentage",
        },
        discountValue: {
            type: Number,
            required: [true, "Discount value is required"],
        },
        minOrderValue: {
            type: Number,
            default: 0,
        },
        maxDiscountAmount: {
            type: Number, // Applicable only for 'percentage' discount
        },
        validFrom: {
            type: Date,
            default: Date.now,
        },
        validUntil: {
            type: Date,
            required: [true, "Expiration date is required"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            default: null, // If null, means it's a global platform coupon
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
