const Cart = require("../models/Cart");
const FoodItem = require("../models/FoodItem");

// @desc    Add item to cart (or update quantity)
// @route   POST /api/cart/add
// @access  User
const addToCart = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    const userId = req.user._id;

    if (!foodId) {
      return res.status(400).json({ message: "Food ID is required" });
    }

    const food = await FoodItem.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, restaurantId: food.restaurantId, items: [], totalAmount: 0 });
    } else if (cart.restaurantId && cart.restaurantId.toString() !== food.restaurantId.toString()) {
      if (cart.items.length > 0) {
        return res.status(400).json({
          message: "Cart contains items from another restaurant. Please clear cart first."
        });
      } else {
        cart.restaurantId = food.restaurantId; // update if empty
      }
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQty = quantity !== undefined ? quantity : cart.items[existingItemIndex].quantity + 1;
      if (newQty <= 0) {
        cart.items.splice(existingItemIndex, 1);
      } else {
        cart.items[existingItemIndex].quantity = newQty;
      }
    } else {
      cart.items.push({ foodId, quantity: quantity || 1 });
    }

    // Recalculate totals
    let itemTotal = 0;
    for (const item of cart.items) {
      const foodData = await FoodItem.findById(item.foodId);
      if (foodData) {
        itemTotal += foodData.price * item.quantity;
      }
    }

    cart.itemTotal = itemTotal;
    cart.taxAmount = Math.round(itemTotal * 0.05); // 5% GST

    // Free delivery for Premium Users
    cart.deliveryFee = (itemTotal > 0 && !req.user.isPremium) ? 40 : 0;

    cart.discountAmount = 0; // Hook up coupons later
    cart.totalAmount = cart.itemTotal + cart.taxAmount + cart.deliveryFee - cart.discountAmount;

    if (cart.items.length === 0) {
      cart.restaurantId = null;
    }

    await cart.save();

    // Populate and return
    const populatedCart = await Cart.findById(cart._id).populate("items.foodId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  User
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate("items.foodId");

    if (!cart) {
      cart = { userId: req.user._id, items: [], totalAmount: 0 };
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:foodId
// @access  User
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.foodId.toString() !== req.params.foodId
    );

    // Recalculate totals
    let itemTotal = 0;
    for (const item of cart.items) {
      const foodData = await FoodItem.findById(item.foodId);
      if (foodData) {
        itemTotal += foodData.price * item.quantity;
      }
    }

    cart.itemTotal = itemTotal;
    cart.taxAmount = Math.round(itemTotal * 0.05); // 5% GST

    // Free delivery for Premium Users
    cart.deliveryFee = (itemTotal > 0 && !req.user.isPremium) ? 40 : 0;

    cart.discountAmount = 0;
    cart.totalAmount = cart.itemTotal + cart.taxAmount + cart.deliveryFee - cart.discountAmount;

    if (cart.items.length === 0) {
      cart.restaurantId = null;
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.foodId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  User
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      cart.restaurantId = null;
      cart.itemTotal = 0;
      cart.taxAmount = 0;
      cart.deliveryFee = 0;
      cart.discountAmount = 0;
      cart.totalAmount = 0;
      await cart.save();
    }
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addToCart, getCart, removeFromCart, clearCart };
