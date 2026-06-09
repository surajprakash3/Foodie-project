const router = require("express").Router();
const {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
  getNearbyRestaurants,
} = require("../controllers/restaurantController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

router.get("/nearby", getNearbyRestaurants);

router
  .route("/")
  .get(getRestaurants)
  .post(protect, authorizeRoles("SuperAdmin"), upload.single("image"), createRestaurant);

router
  .route("/:id")
  .get(getRestaurant)
  .put(protect, authorizeRoles("SuperAdmin", "RestaurantAdmin"), upload.single("image"), updateRestaurant)
  .delete(protect, authorizeRoles("SuperAdmin"), deleteRestaurant);

router
  .route("/:id/approve")
  .put(protect, authorizeRoles("SuperAdmin"), approveRestaurant);

module.exports = router;
