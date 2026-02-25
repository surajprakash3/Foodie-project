const router = require("express").Router();
const {
  getAllFoods,
  getCategories,
  createGlobalFoodItem,
  createFoodItem,
  getFoodsByRestaurant,
  updateFoodItem,
  deleteFoodItem,
} = require("../controllers/foodController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

// ...existing code...
router.route("/").get(getAllFoods);
router.route("/categories").get(getCategories);
router
  .route("/create")
  .post(protect, adminOnly, upload.single("image"), createGlobalFoodItem);

// ...existing code...
router
  .route("/item/:id")
  .put(protect, adminOnly, upload.single("image"), updateFoodItem)
  .delete(protect, adminOnly, deleteFoodItem);

// ...existing code...
router
  .route("/:restaurantId")
  .get(getFoodsByRestaurant)
  .post(protect, adminOnly, upload.single("image"), createFoodItem);

module.exports = router;
