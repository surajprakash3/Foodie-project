const Restaurant = require("../models/Restaurant");
const { cloudinary } = require("../config/cloudinary");

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Admin
const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, isActive, status, isPremium, commissionRate, avgPreparationTime, latitude, longitude } = req.body;
    const image = req.file ? req.file.path : "";

    const restaurant = await Restaurant.create({
      name,
      image,
      description,
      address,
      isActive: isActive !== undefined ? isActive : true,
      status: status || "Open",
      isPremium: isPremium !== undefined ? isPremium : false,
      commissionRate: commissionRate !== undefined ? commissionRate : 15,
      avgPreparationTime: avgPreparationTime !== undefined ? avgPreparationTime : 30,
      location: {
        type: "Point",
        coordinates: [
          longitude ? parseFloat(longitude) : 0,
          latitude ? parseFloat(latitude) : 0
        ]
      }
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get nearby restaurants
// @route   GET /api/restaurants/nearby
// @access  Public
const getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, distance = 10 } = req.query; // distance in kilometers

    if (!lat || !lng) {
      // Fallback to all sort by premium then newest
      const restaurants = await Restaurant.find({ isActive: true }).sort({ isPremium: -1, createdAt: -1 });
      return res.json(restaurants);
    }

    const restaurants = await Restaurant.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(distance) * 1000, // meters
        },
      },
    }).sort({ isPremium: -1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ isPremium: -1, createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Admin
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { name, description, address, isActive, status, isPremium, commissionRate, avgPreparationTime, latitude, longitude } = req.body;

    restaurant.name = name || restaurant.name;
    restaurant.description = description !== undefined ? description : restaurant.description;
    restaurant.address = address || restaurant.address;
    restaurant.isActive = isActive !== undefined ? isActive : restaurant.isActive;
    restaurant.status = status || restaurant.status;
    restaurant.isPremium = isPremium !== undefined ? isPremium : restaurant.isPremium;
    restaurant.commissionRate = commissionRate !== undefined ? commissionRate : restaurant.commissionRate;
    restaurant.avgPreparationTime = avgPreparationTime !== undefined ? avgPreparationTime : restaurant.avgPreparationTime;

    if (latitude && longitude) {
      restaurant.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (restaurant.image) {
        const publicId = restaurant.image.split("/").slice(-2).join("/").split(".")[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          // Ignore cloudinary deletion errors
        }
      }
      restaurant.image = req.file.path;
    }

    const updated = await restaurant.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Admin
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Delete image from Cloudinary
    if (restaurant.image) {
      const publicId = restaurant.image.split("/").slice(-2).join("/").split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        // Ignore
      }
    }

    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Approve or Reject restaurant
// @route   PUT /api/restaurants/:id/approve
// @access  SuperAdmin
const approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { status, isActive } = req.body;

    if (status) restaurant.status = status;
    if (isActive !== undefined) restaurant.isActive = isActive;

    const updated = await restaurant.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getNearbyRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
};
