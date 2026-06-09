const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "Busy"],
      default: "Open",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    commissionRate: {
      type: Number,
      default: 15, // Default platform commission percentage
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    avgPreparationTime: {
      type: Number,
      default: 30, // in minutes
    },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // Array of numbers [longitude, latitude]
        required: true,
        default: [0, 0], // Default to Null Island if not provided
      },
    },
  },
  { timestamps: true }
);

restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);
