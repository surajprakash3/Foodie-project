const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

// Prevent user from submitting more than one review per order
reviewSchema.index({ userId: 1, orderId: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (restaurantId) {
    const obj = await this.aggregate([
        {
            $match: { restaurantId: restaurantId },
        },
        {
            $group: {
                _id: "$restaurantId",
                averageRating: { $avg: "$rating" },
                numOfReviews: { $sum: 1 }
            },
        },
    ]);

    try {
        const Restaurant = mongoose.model('Restaurant');
        if (obj[0]) {
            await Restaurant.findByIdAndUpdate(restaurantId, {
                rating: Math.round(obj[0].averageRating * 10) / 10,
                totalReviews: obj[0].numOfReviews,
            });
        } else {
            await Restaurant.findByIdAndUpdate(restaurantId, {
                rating: 0,
                totalReviews: 0,
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post("save", function () {
    this.constructor.getAverageRating(this.restaurantId);
});

// Call getAverageRating before remove
reviewSchema.pre("remove", function () {
    this.constructor.getAverageRating(this.restaurantId);
});

module.exports = mongoose.model("Review", reviewSchema);
