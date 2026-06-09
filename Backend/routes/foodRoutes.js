const router = require("express").Router();
const {
  getAllFoods,
  getCategories,
  createGlobalFoodItem,
  createFoodItem,
  getFoodsByRestaurant,
  updateFoodItem,
  deleteFoodItem,
  getTrendingFoods,
} = require("../controllers/foodController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

// ...existing code...
router.route("/").get(getAllFoods);
router.route("/categories").get(getCategories);
router.route("/trending").get(getTrendingFoods);
router
  .route("/create")
  .post(protect, authorizeRoles("SuperAdmin", "RestaurantAdmin"), upload.single("image"), createGlobalFoodItem);

// ...existing code...
router
  .route("/item/:id")
  .put(protect, authorizeRoles("SuperAdmin", "RestaurantAdmin"), upload.single("image"), updateFoodItem)
  .delete(protect, authorizeRoles("SuperAdmin", "RestaurantAdmin"), deleteFoodItem);

// ...existing code...
router
  .route("/:restaurantId")
  .get(getFoodsByRestaurant)
  .post(protect, authorizeRoles("SuperAdmin", "RestaurantAdmin"), upload.single("image"), createFoodItem);

module.exports = router;
